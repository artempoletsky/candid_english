import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function isAdmin() {
  return true;
}

function parseSetCookie(cookieString: string): Record<string, string> {
  let res: Record<string, string> = {};
  let arr = cookieString.split(";").map(e => e.trim().split("="))[0];
  res[arr[0]] = arr[1];
  return res;
}

function parseCookie(cookieString: string): Record<string, string> {

  if (cookieString === "")
    return {};

  let pairs = cookieString.split(";");

  let splittedPairs = pairs.map(cookie => cookie.split("="));


  const cookieObj = splittedPairs.reduce(function (obj: Record<string, string>, cookie) {

    obj[decodeURIComponent(cookie[0].trim())]
      = decodeURIComponent(cookie[1].trim());

    return obj;
  }, {})

  return cookieObj;
}


function serializeCookies(obj: Record<string, string>): string {
  return Object.keys(obj).map(key => `${key}=${obj[key]}`).join("; ");
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;


  const session_route = "/session"
  if (pathname == session_route || pathname.startsWith("/_next/")) {
    return;
  }

  const sessionRes: Response = await fetch(request.nextUrl.origin + "/session", {
    headers: {
      cookie: request.headers.get("cookie") || ""
    }
  });
  const newCookies = sessionRes.headers.getSetCookie();

  const requestHeaders = new Headers(request.headers);

  const cookies = parseCookie(requestHeaders.get("Cookie") || "");

  for (const cookie of newCookies) {
    const p = parseSetCookie(cookie);
    Object.assign(cookies, p);
  }

  requestHeaders.set("Cookie", serializeCookies(cookies));

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