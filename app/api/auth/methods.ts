import { cookies, headers } from "next/headers";
import { getSession } from "~/app/session/session";
import { methodFactory } from "~/db";
import { AuthData, UserLight, UserRights, UserSelf } from "~/globals";
// import { getCsrfToken } from "next-auth/react";

async function getCsrfToken() {
  const hdrs = new Headers(headers());
  hdrs.delete("content-length");

  const res = await fetch(hdrs.get("origin") + "/api/auth/csrf", {
    headers: hdrs,
  }).then(res => res.json());
  return res.csrfToken;
}

function getAuthCSRF() {
  const cookieVals = cookies().get("next-auth.csrf-token");
  return decodeURI(cookieVals?.value || "").split('|')[0];
}

function sleep(time: number = 200) {
  return (new Promise((resolve) => {
    setTimeout(resolve, time);
  }));
}

async function createFormData(payload: Record<string, string>) {
  const data = new FormData();
  const csrfToken = await getCsrfToken();

  if (!csrfToken) throw new Error("no token");

  data.set("csrfToken", csrfToken);
  for (const key in payload) {
    data.set(key, payload[key]);
  }
  return data;
}

async function doPost(url: string, payload: Record<string, string>) {

  const hdrs = new Headers(headers());

  hdrs.set("content-type", "application/x-www-form-urlencoded");
  // hdrs.set("content-type", "application/json");
  hdrs.delete("content-length");

  const body = await createFormData({
    ...payload,
  });

  console.log(hdrs.get("Referer"));
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
  // console.log();

  return fetch(hdrs.get("origin") + url, {
    headers: hdrs,
    method: "POST",
    body: bodyStr,
    redirect: "manual",
  });
}


export async function clearSession() {
  const session = await getSession();
  session.authUser = undefined;
  session.user = undefined;
}

export async function logout() {

  // const { NEXTAUTH_URL } = process.env;
  // if (!NEXTAUTH_URL) throw new Error("Specify NEXTAUTH_URL");


  // console.log(url);

  const result = await doPost("/api/auth/signout", {});

  await clearSession();
}
export type FLogout = typeof logout;

///////////////////////////////////////////////////
export type ALogin = {
  password: string;
  username: string;
}
export async function login({ password, username }: ALogin) {

  const result = await doPost("/api/auth/callback/credentials", {
    redirect: "false",
    callbackUrl: "/user",
    json: "true",
    username,
    password,
  });

  return result.status == 200;
}
export type FLogin = typeof login;



export type RGetUserDataByAuth = {
  user: UserSelf;
};

export const getUserDataByAuth = methodFactory<AuthData, RGetUserDataByAuth>(({ users }, auth, { $, drill }) => {
  const email = auth.email;
  if (!email) throw new Error("Email must be valid");


  let user: UserLight | undefined = users.where("email", email).select(rec => rec.$light())[0];

  if (!user) {
    let username = (email.match(/^([^@]+)@.*$/) as string[])[1] || "";
    if (users.has(username)) {
      username = users.getFreeId();
    }
    users.insert({
      emailConfirmed: true,
      knownWordsVersion: new Date(0),
      password: "",
      knownWords: [],
      username,
      email,
      image: auth.image || "",
      fullName: auth.name || "",
    });
    user = users.at(username, rec => rec.$light());
  }

  return {
    user: drill.userSelf(user),
  };
});

