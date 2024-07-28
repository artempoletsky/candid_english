import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { getSession } from "app/session/session";
import { query } from "app/db";
import { UserFull, UserLight, UserSelf } from "app/globals";
import { clearSession, createOrGetUser } from "../methods";
import { authorize } from "./adapter";

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;
// if (process.env.NODE_ENV !== "build" && (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET)) throw new Error("Google ENV credentials is invalid!");

const handler = NextAuth({
  callbacks: {
    redirect(params) {
      return params.baseUrl + "/user";
    },
  },
  events: {
    async signIn(message) {
      await createOrGetUser(message.user as unknown as UserSelf);
    },
    async signOut(message) {
      await clearSession();
    },
  },
  providers: [
    Credentials({
      name: "username",
      credentials: {
        username: {
          label: "Username or email",
          type: "text",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      authorize: authorize as any,
    }),
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID!,
      clientSecret: GOOGLE_CLIENT_SECRET!,
    }),
  ]
});

export { handler as GET, handler as POST };