import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { getSession } from "app/session/session";
import { query } from "app/db";
import { UserFull, UserLight } from "app/globals";
import { clearSession, createOrGetUser } from "../methods";

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) throw new Error("Google ENV credentials is invalid!");

const handler = NextAuth({
  callbacks: {
    redirect(params) {
      return params.baseUrl + "/user";
    },
  },
  events: {
    async signIn(message) {
      await createOrGetUser(message.user);
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
      async authorize(credentials, request) {
        const user: UserLight | undefined = await query(({ users }, { username, password }, { $ }) => {
          // let user: UserLight;
          const passwordEncoded = $.encodePassword(password);
          const found = users.where("username", username).where("password", passwordEncoded).limit(1).select(r => r.$light());
          if (found.length) return found[0];
          return users.where("email", username).where("password", passwordEncoded).limit(1).select(u => u.$light())[0];
        }, credentials as { username: string, password: string });
        if (!user) return null;
        return {
          id: user.username,
          email: user.email,
          name: user.fullName,
          image: user.image,
        };
      },
    }),
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    }),
  ]
});

export { handler as GET, handler as POST };