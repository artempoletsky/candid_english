export function parseSetCookie(cookieString: string): Record<string, string> {
  let res: Record<string, string> = {};
  let arr = cookieString.split(";").map(e => e.trim().split("="))[0];
  res[arr[0]] = arr[1];
  return res;
}

export function parseCookie(cookieString: string): Record<string, string> {

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


export function serializeCookies(obj: Record<string, string>): string {
  return Object.keys(obj).map(key => `${key}=${obj[key]}`).join("; ");
}

export function validateSession(){

}
const utils = {
  parseSetCookie,
  parseCookie,
  serializeCookies,
  validateSession,
}

export default utils;