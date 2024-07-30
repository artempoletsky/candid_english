import { AuthOptions, User as NextAuthUser } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { AuthData, UserLight, UserSelf } from "app/globals";
import { query } from "app/db";
import { getSession } from "app/session/session";

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;
// if (process.env.NODE_ENV !== "build" && (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET)) throw new Error("Google ENV credentials is invalid!");


async function clearSession() {
  const session = await getSession();
  session.authUser = undefined;
  session.user = undefined;
}

export async function createOrGetUser(auth: AuthData) {
  const email = auth.email;
  if (!email) throw new Error("Email must be valid");
  const session = await getSession();

  let user: UserSelf;
  if (email == "master") {
    user = {
      id: 0,
      isAdmin: true,
      isModerator: true,
      email: "master",
      englishLevel: "a0",
      emailVerified: true,
      fullName: "",
      image: "",
      wordsCount: 0,
      username: "",
      knownWordsVersion: new Date(),
      isPasswordSet: true,
    }
  } else {
    user = await query(({ users }, { email, englishLevel, auth }, { drill }) => {

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

      return drill.userSelf(user!);
    }, { email, englishLevel: session.englishLevel, auth });
  }

  session.user = user;
  session.englishLevel = user.englishLevel;
  session.authUser = auth;
  return { user };
}


async function authorize(credentials?: Record<"username" | "password", string>): Promise<NextAuthUser | null> {
  if (!credentials) return null;

  if (
    credentials.username == process.env.KURGANDB_MASTER_USER
    && credentials.password == process.env.KURGANDB_MASTER_PASSWORD
  ) {
    return {
      id: "-1",
      email: "master",
      image: "",
      name: "",
    };
  }

  const user: UserLight | null = await query(({ users }, { username, password }, { drill, $ }) => {
    // let user: UserLight;
    const passwordEncoded = $.encodePassword(password);
    let found = users.where("username", username).where("password", passwordEncoded).limit(1).select(r => r.$light());
    if (!found.length) found = users.where("email", username).where("password", passwordEncoded).limit(1).select(u => u.$light());
    if (!found.length) return null;
    return found[0];
  }, credentials);
  if (!user) return null;
  return {
    id: user.id + "",
    email: user.email,
    image: user.image,
    name: user.fullName,
  };
}

const options: AuthOptions = {
  callbacks: {
    redirect(params) {
      return params.baseUrl + "/user";
    },
    async session(arg) {
      const session: any = arg.session;
      const token = arg.token;
      session.isAdmin = false;

      if (token.isAdmin) {
        session.isAdmin = token.isAdmin;
      }
      return session;
    },
    async jwt(arg) {

      const user = arg.user;
      const token = arg.token;

      if (user && user.email == "master") {
        token.isAdmin = true;
      } else if (user && user.email) {
        const isAdmin = await query(({ user_rights, users }, { email }) => {
          const user = users.where("email", email).select()[0];
          if (!user) return false;
          if (!user_rights.has(user.id)) return false;
          return user_rights.at(user.id).isAdmin;
        }, { email: user.email });
        token.isAdmin = isAdmin;
      }
      // console.log(token);

      return token;
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
      authorize: authorize,
    }),
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID!,
      clientSecret: GOOGLE_CLIENT_SECRET!,
    }),
  ]
}

export default options;