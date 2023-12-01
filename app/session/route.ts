import { NextRequest, userAgent } from "next/server";
import { COOKIE_SESSION_KEY, SESSION_DIR } from "~/lib/paths";




import fs, { existsSync } from "fs";
import md5 from "md5";
import { debounce } from "lodash";
import { createIfNotExists, rfs, wfs } from "~/lib/util";
import { cookies, headers } from 'next/headers'
import { NextResponse } from "next/server";

// createIfNotExists()
export async function isGuest() {
  return true;
}

export async function isAdmin() {
  return true;
}

function getSessionFileName(token: string) {
  return SESSION_DIR + token + ".json";
}

export function getSession(): Record<string, any> {
  const sessid = getCookieToken();
  
  if (!sessid) {
    throw new Error("Session ID must not be empty");
  }
  return getFileProxy(getSessionFileName(sessid));
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

  wfs(getSessionFileName(sessid), {
    secret,
    data: {}
  });
  return sessid;
}


function generateSessionID(req: NextRequest, secret: string): string {
  let ua = userAgent({
    headers: req.headers
  });

  return md5(req.ip + ua.ua + secret);
}

function getFileProxy(filename: string): Record<string, any> {
  let sessionFile: Record<string, any> = rfs(filename);
  // let debouncedWrite = debounce(() => {
  //   wfs(filename, sessionFile);
  // }, 100);
  const debouncedWrite = ()=> {
    wfs(filename, sessionFile);
  };

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
  let res = NextResponse.json({});

  if (!isValidSession(req)) {
    res.cookies.set(COOKIE_SESSION_KEY, createNewSession(req));
  }

  return res;
}