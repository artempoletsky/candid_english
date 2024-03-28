import { cookies } from "next/headers";
import { PlainObject } from "./util";



function setCookies(setCookie: string[]) {
  const cookiesObj = cookies();
  for (const c of setCookie) {
    const split = c.split("; ");
    const first = split[0].split("=");
    const optionsRaw = split.slice(1);

    const options = optionsRaw.reduce((res, val) => {
      const split = val.split("=");
      const first = split[0][0].toLowerCase() + split[0].slice(1);
      if (first == "expires") {
        res[first] = new Date(first);
      } else {
        res[first] = split[1] || true;
      }

      return res;
    }, {} as any);

    // console.log(options);
    // console.log(first[0], first[1]);
    cookiesObj.set(first[0], first[1], options);
  }
}

function setCookieHeaders(currentCookie: string, setCookie: string[]) {

  const currentCookieObj: Record<string, string> = !currentCookie ? {} : currentCookie.split("; ").reduce((res, val) => {
    const split = val.split("=");
    res[split[0]] = split[1];
    return res;
  }, {} as Record<string, string>);
  // console.log(currentCookieObj);
  for (const c of setCookie) {
    const split = c.split("; ");
    const first = split[0].split("=");
    currentCookieObj[first[0]] = first[1];
  }
  // console.log(currentCookieObj);

  let newCookies: string[] = [];
  for (const key in currentCookieObj) {
    const value = currentCookieObj[key];
    // console.log(value, decodeURI(value));

    newCookies.push(`${key}=${value}`);
  }
  // console.log(newCookies);

  return newCookies.join("; ");
}

export default async function emulateUserFetch(url: string, cookie: string, payload: PlainObject): Promise<[Response, string]> {
  payload.headers.set("cookie", cookie);
  let result = await fetch(url, payload);
  let setCookie: string[] = result.headers.getSetCookie().map(c => decodeURIComponent(c));

  const newCookies = setCookieHeaders(cookie, setCookie);
  setCookies(setCookie);
  return [result, newCookies];
}