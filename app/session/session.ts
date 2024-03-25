
import { AuthData, Session, UserLight } from "~/globals";
import { COOKIE_SESSION_KEY, SESSION_DIR } from "~/lib/paths";
import md5 from "md5";
import { rfs, wfs } from "~/lib/util";
import { existsSync } from "fs";
import { NextRequest, userAgent } from "next/server";
import { cookies, headers } from "next/headers";
import debounce from "lodash.debounce";
import { getServerSession } from "next-auth";
import { methodFactory, query } from "~/db";


function getSessionFileName(token: string) {
  return SESSION_DIR + token + ".json";
}


export async function getSessionById(sessid: string): Promise<Session> {
  if (!sessid) {
    throw new Error("Session ID must not be empty");
  }

  const result = getFileProxy(getSessionFileName(sessid));
  return result;
}

export async function getSession() {
  return getSessionById(getCookieToken());
}

function getCookieToken(): string {
  const cookie = cookies().get(COOKIE_SESSION_KEY);

  return cookie?.value || "";
}

export function isValidSession(req: NextRequest): boolean {
  const sessid = req.cookies.get(COOKIE_SESSION_KEY)?.value || "";
  if (!sessid) return false;

  if (!existsSync(process.cwd() + getSessionFileName(sessid))) return false;

  let sessionFile = rfs(getSessionFileName(sessid));
  let secret: string = sessionFile.secret;

  return sessid == generateSessionID(req, secret);
}


export function createNewSession(req: NextRequest): string {
  const secret = md5("" + Date.now() + Math.random());
  const sessid = generateSessionID(req, secret);

  const sessData: Session = {
    id: sessid,
    englishLevel: "",
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

const cache: Record<string, { data: Session }> = {};
function getFileProxy(filename: string): Session {
  if (cache[filename]) return cache[filename].data;

  let sessionFile: any = rfs(filename);
  let debouncedWrite = debounce(() => {
    wfs(filename, sessionFile);
    delete cache[filename];
  }, 100);
  // const debouncedWrite = ()=> {
  //   wfs(filename, sessionFile);
  // };

  const data = sessionFile.data || {};

  const proxyObject = new Proxy<any>(data, {
    deleteProperty(target, p) {
      debouncedWrite();
      return delete target[p];
    },
    get: (target, key) => {
      return target[key];
    },
    set: (target, key, value) => {
      target[key] = value;
      debouncedWrite();
      return true;
    }
  });
  sessionFile.data = proxyObject;
  cache[filename] = sessionFile;

  return proxyObject;
}
