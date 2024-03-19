import { NextRequest, userAgent } from "next/server";
import { COOKIE_SESSION_KEY, SESSION_DIR } from "~/lib/paths";




import fs, { existsSync } from "fs";
import md5 from "md5";
import { debounce } from "lodash";
import { createIfNotExists, rfs, wfs } from "~/lib/util";
import { cookies, headers } from 'next/headers'
import { NextResponse } from "next/server";
import { Session } from "./session";
import { MiddlewareSession, SESSION_CACHE_LIFESPAN } from "~/middleware";


function getSessionFileName(token: string) {
  return SESSION_DIR + token + ".json";
}

function getSessionById(sessid: string): Session {
  if (!sessid) {
    throw new Error("Session ID must not be empty");
  }
  return getFileProxy(getSessionFileName(sessid)) as Session;
}

export function getSession(): Session {
  return getSessionById(getCookieToken());
}

function getCookieToken(): string {
  const cookie = cookies().get(COOKIE_SESSION_KEY);
  return cookie?.value || "";
}

function isValidSession(req: NextRequest): boolean {
  const sessid = req.cookies.get(COOKIE_SESSION_KEY)?.value || "";
  if (!sessid) return false;

  if (!existsSync(process.cwd() + getSessionFileName(sessid))) return false;

  let sessionFile = rfs(getSessionFileName(sessid));
  let secret: string = sessionFile.secret;

  return sessid == generateSessionID(req, secret);
}


function createNewSession(req: NextRequest): string {
  const secret = md5("" + Date.now() + Math.random());
  const sessid = generateSessionID(req, secret);

  const sessData: Session = {
    id: sessid,
    username: "",
    isAdmin: false,
  };

  wfs(getSessionFileName(sessid), {
    secret,
    data: sessData
  });
  return sessid;
}


function generateSessionID(req: NextRequest, secret: string): string {
  let hdrs = headers();
  let ua = userAgent({
    headers: hdrs
  });

  // console.log(hdrs);

  return md5(req.ip + ua.ua + secret);
}


function getFileProxy(filename: string): Record<string, any> {
  let sessionFile: Record<string, any> = rfs(filename);
  let debouncedWrite = debounce(() => {
    wfs(filename, sessionFile);
  }, 100);
  // const debouncedWrite = ()=> {
  //   wfs(filename, sessionFile);
  // };

  if (!sessionFile.data) {
    sessionFile.data = {};
  }

  const proxyObject = new Proxy(sessionFile.data, {
    set: (data, key, value) => {
      data[key as string] = value;
      debouncedWrite();
      return true;
    }
  });

  return proxyObject;
}


export async function GET(req: NextRequest) {
  const sessid = createNewSession(req);
  const session = getSessionById(sessid);
  const result: MiddlewareSession = {
    id: sessid,
    isAdmin: session.isAdmin,
    middlewareCacheExpires: Date.now() + SESSION_CACHE_LIFESPAN,
  };
  // console.log("session/GET");


  let res = NextResponse.json(result);
  if (!isValidSession(req)) {
    res.cookies.set(COOKIE_SESSION_KEY, sessid);
  }

  return res;
}