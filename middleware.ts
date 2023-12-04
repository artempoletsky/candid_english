import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import utils from './lib/middleware_utils';
import { COOKIE_SESSION_KEY } from './lib/paths';

function isAdmin() {
  return true;
}

//stores valid session IDs
const SESSION_CACHE: Record<string, number> = {};
const SESSION_CACHE_LIFESPAN = 5 * 60 * 1000;
setInterval(() => {
  let now = Date.now();
  for (const key in SESSION_CACHE) {
    if (now + SESSION_CACHE_LIFESPAN > SESSION_CACHE[key]) {
      delete SESSION_CACHE[key];
      // console.log(key + " removed from cache");
    }
  }
}, SESSION_CACHE_LIFESPAN)

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;


  const session_route = "/session"
  if (pathname == session_route || pathname.startsWith("/_next/")) {
    return;
  }

  const requestCookiesStr = request.headers.get("Cookie") || "";

  const cookies = utils.parseCookie(requestCookiesStr);
  const requestHeaders = new Headers(request.headers);

  let sessid = cookies[COOKIE_SESSION_KEY];
  let newCookies: string[] = [];
  if (!SESSION_CACHE[sessid]) {
    const sessionRes: Response = await fetch(request.nextUrl.origin + "/session", {
      headers: {
        cookie: requestCookiesStr
      }
    });

    newCookies = sessionRes.headers.getSetCookie();
    for (const cookie of newCookies) {
      const p = utils.parseSetCookie(cookie);
      Object.assign(cookies, p);
    }
    requestHeaders.set("Cookie", utils.serializeCookies(cookies));
    SESSION_CACHE[cookies[COOKIE_SESSION_KEY]] = Date.now();
  } else {
    // console.log(sessid + " cached");
  }

  const res = NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });

  for (const cookie of newCookies) {
    res.headers.append("Set-Cookie", cookie);
  }

  const authPage = "/admin/auth";
  if (!isAdmin() && pathname.startsWith("/admin/") && pathname != authPage) {
    return NextResponse.redirect(new URL(authPage, request.url));
  }

  return res;

}