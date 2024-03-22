import { NextRequest, userAgent } from "next/server";
import { COOKIE_SESSION_KEY, SESSION_DIR } from "~/lib/paths";

import { NextResponse } from "next/server";

import { MiddlewareSession, SESSION_CACHE_LIFESPAN } from "~/middleware";
import { createNewSession, getSessionById, isValidSession } from "./session";




export async function GET(req: NextRequest) {
  const sessid = createNewSession(req);
  const session = await getSessionById(sessid);
  const result: MiddlewareSession = {
    id: sessid,
    isAdmin: session.isAdmin,
    middlewareCacheExpires: Date.now() + SESSION_CACHE_LIFESPAN,
  };
  // console.log("session/GET");


  let res = NextResponse.json(result);
  if (!isValidSession(req)) {
    res.cookies.set(COOKIE_SESSION_KEY, sessid, {
      httpOnly: true,
    });
  }

  return res;
}