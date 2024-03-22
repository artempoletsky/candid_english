import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { getSession, getUserDataByAuth } from "~/app/session/session";
import { query } from "~/db";
import { UserFull, UserLight } from "~/globals";

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) throw new Error("Google ENV credentials is invalid!");

const handler = NextAuth({
  callbacks: {
    redirect(params) {
      return "/user"
    },
  },
  events: {
    async signIn(message) {
      const session = await getSession();
      session.authUser = message.user;
      const { user, isAdmin } = await getUserDataByAuth(session.authUser);
      session.user = user;
      session.isAdmin = isAdmin;
    },
    async signOut(message) {
      const session = await getSession();
      session.user = undefined;
      session.isAdmin = false;
      session.authUser = undefined;
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
          let user: UserLight;
          if (users.has(username)) {
            user = users.at(username, r => r.$light());
            if (user.password == $.encodePassword(password)) {
              return user;
            }
            return undefined;
          }
          return users.where("email", username).where("password", $.encodePassword(password)).select($.full)[0];
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