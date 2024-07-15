import { cookies, headers } from "next/headers";
import { getSession } from "app/session/session";
import { methodFactory, query } from "app/db";
import { AuthData, UserLight, UserRights, UserSelf } from "app/globals";
import emulateUserFetch from "lib/emulateUserFetch";
// import { getCsrfToken } from "next-auth/react";

async function getCsrfToken(): Promise<[any, string]> {
  const hdrs = new Headers(headers());
  hdrs.set("content-type", "application/json");
  hdrs.delete("content-length");
  const [response, newCookies] = await emulateUserFetch(hdrs.get("origin") + "/api/auth/csrf", hdrs.get("cookie") || "", {
    headers: hdrs,
    redirect: "manual",
  });

  return [await response.json(), newCookies];
}

async function createFormData(payload: Record<string, string>): Promise<[FormData, string]> {
  const data = new FormData();

  const [csrfToken, newCookies] = await getCsrfToken();

  if (!csrfToken) throw new Error("no token");

  data.set("csrfToken", csrfToken.csrfToken);
  for (const key in payload) {
    data.set(key, payload[key]);
  }
  return [data, newCookies];
}

export async function authRequest(url: string, payload: Record<string, string>) {


  const [body, newCookies] = await createFormData({
    ...payload,
  });

  // fetch("http://localhost:3000/api/auth/callback/credentials", {
  //   "headers": {
  //     "accept": "*/*",
  //     "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
  //     "content-type": "application/x-www-form-urlencoded",
  //     "sec-ch-ua": "\"Chromium\";v=\"122\", \"Not(A:Brand\";v=\"24\", \"Google Chrome\";v=\"122\"",
  //     "sec-ch-ua-mobile": "?0",
  //     "sec-ch-ua-platform": "\"Windows\"",
  //     "sec-fetch-dest": "empty",
  //     "sec-fetch-mode": "cors",
  //     "sec-fetch-site": "same-origin",
  //     "cookie": "next-auth.csrf-token=47ecabcbd91fcec06aefac23d9e1c72ed5e314f16c49188ce275af405a183c62%7C4a29957ebc0823da078d4c202a90e9e0f345b23d177fc5e57e0cc15ee6705bf1; CandidEnglish=a1e04e037f1d14076b9c30478883b277; next-auth.callback-url=%2Fuser; next-auth.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..0iOZace5z132X_gY.68BakV5GpCn2_9UvTK8RUHwP0nM09OiMORf3M7MYnLe3W7eXOkVCw-h6yHC_CSuKVkZSiBh3n8AwTjyqrAB8uyMZ79oAxmvtrLT4nebdmeGFWCiZ-8NEh4euBcZt9HgnHvGDOnwRZX4-ecagOLVLOZPcFpcfx1in_xQJ9f35O8abeFIcgcPdhCQQrH_SgQDDNj1nuag.FE5rCFbaHF4o3Z2PBQDxmw",
  //     "Referer": "http://localhost:3000/user",
  //     "Referrer-Policy": "strict-origin-when-cross-origin"
  //   },
  //   "body": "redirect=false&username=&password=&callbackUrl=%2Fuser&csrfToken=47ecabcbd91fcec06aefac23d9e1c72ed5e314f16c49188ce275af405a183c62&json=true",
  //   "method": "POST"
  // });

  // console.log(hdrs.get("cookie"));
  const bodyStr = new URLSearchParams(body as any).toString();

  const hdrs = new Headers(headers());

  hdrs.set("content-type", "application/x-www-form-urlencoded");
  hdrs.delete("content-length");
  hdrs.set("cookie", newCookies);

  const [result] = await emulateUserFetch(hdrs.get("origin") + url, newCookies, {
    headers: hdrs,
    method: "POST",
    body: bodyStr,
    redirect: "manual",
  });
  return result;
}


export async function authorize(credentials?: Record<"username" | "password", string>): Promise<UserSelf | null> {
  if (!credentials) return null;

  if (
    credentials.username == process.env.KURGANDB_MASTER_USER
    && credentials.password == process.env.KURGANDB_MASTER_PASSWORD
  ) {
    return {
      id: 0,
      isAdmin: true,
      email: "none",
      image: "",
      username: "master",
      emailVerified: true,
      englishLevel: "a0",
      isPasswordSet: true,
      fullName: "",
      wordsCount: 0,
      isModerator: true,
      knownWordsVersion: new Date(),
    };
  }

  const user: UserSelf | null = await query(({ users }, { username, password }, { drill, $ }) => {
    // let user: UserLight;
    const passwordEncoded = $.encodePassword(password);
    let found = users.where("username", username).where("password", passwordEncoded).limit(1).select(r => r.$light());
    if (!found.length) found = users.where("email", username).where("password", passwordEncoded).limit(1).select(u => u.$light());
    if (!found.length) return null;
    return drill.userSelf(found[0]);
  }, credentials);
  if (!user) return null;
  return user;
}