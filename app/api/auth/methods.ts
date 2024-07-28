import { cookies, headers } from "next/headers";
import { getSession } from "app/session/session";
import { methodFactory, query } from "app/db";
import { AuthData, UserLight, UserRights, UserSelf } from "app/globals";
import emulateUserFetch from "lib/emulateUserFetch";
import { authRequest } from "./[...nextauth]/adapter";
// import { getCsrfToken } from "next-auth/react";

export async function clearSession() {
  const session = await getSession();
  session.authUser = undefined;
  session.user = undefined;
}

export async function logout() {

  // const { NEXTAUTH_URL } = process.env;
  // if (!NEXTAUTH_URL) throw new Error("Specify NEXTAUTH_URL");


  // console.log(url);

  const result = await authRequest("/api/auth/signout", {});

  await clearSession();
}
export type FLogout = typeof logout;

///////////////////////////////////////////////////
export type ALogin = {
  password: string;
  username: string;
}
export async function login({ password, username }: ALogin) {
  const result = await authRequest("/api/auth/callback/credentials", {
    redirect: "false",
    callbackUrl: "/user",
    json: "true",
    username,
    password,
  });

  if (result.status == 200) {
    try {
      const resJSON = await result.json();
      if (resJSON.url) return true;
    } catch (error) {
      return false;
    }
  }
  return false;
}
export type FLogin = typeof login;



export type RGetUserDataByAuth = {
  user: UserSelf;
};

export async function createOrGetUser(auth: AuthData) {
  const email = auth.email;
  if (!email) throw new Error("Email must be valid");
  const session = await getSession();
  const user = await query(({ users }, { email, englishLevel, auth }, { drill }) => {

    let user: UserLight | undefined = users.where("email", email).select(rec => rec.$light())[0];

    if (!user) {
      let username = (email.match(/^([^@]+)@.*$/) as string[])[1] || "";
      let found = false;
      let resultUsername = username;
      let tries = 1;
      const candidates = new Set<string>()
      users.indexIds<string>("username", (value) => {
        const result = value.startsWith(username);
        if (result) candidates.add(username);
        return false;
      });
      while (candidates.has(resultUsername)) {
        resultUsername = username + tries++;
      }

      const id = users.insert({
        englishLevel: englishLevel || "a0",
        emailVerified: true,
        knownWordsVersion: new Date(0),
        password: "",
        knownWords: [],
        username: resultUsername,
        email,
        image: auth.image || "",
        fullName: auth.name || "",
        wordsCount: 0,
      });
      user = users.at(id, rec => rec.$light());
    }

    return drill.userSelf(user);
  }, { email, englishLevel: session.englishLevel, auth });
  session.user = user;
  session.englishLevel = user.englishLevel;
  session.authUser = auth;
  return { user };
}
