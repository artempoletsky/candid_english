

import { ResponseError } from "@artempoletsky/easyrpc";

import { methodFactory, query } from "app/db";
import { AConfirmEmail, ARegister, AUpdateUserInfo } from "./schemas";
import nodemailer, { Transporter } from "nodemailer";
import { AuthData, SITE_NAME, UserFull, UserLight, UserSelf } from "app/globals";
import { getSession } from "app/session/session";

let transporter: Transporter;
if (process.env.MAIL_HOST) {
  const { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASSWORD } = process.env;
  if (!MAIL_HOST || !MAIL_PORT || !MAIL_USER || !MAIL_PASSWORD) throw new Error("Email credentials are invalid!");

  transporter = nodemailer.createTransport({
    host: MAIL_HOST,
    port: parseInt(MAIL_PORT),
    secure: true,
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASSWORD
    }
  });
} else {
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'colten.stroman21@ethereal.email',
      pass: 'J41c8pcQ5tyXJGe7Hj'
    }
  });
}

// user: 'vtlnmyv7vfbp7ayb@ethereal.email',
// pass: 'MbDsks2wm41FaJTBYJ',
// smtp: { host: 'smtp.ethereal.email', port: 587, secure: false },
// imap: { host: 'imap.ethereal.email', port: 993, secure: true },
// pop3: { host: 'pop3.ethereal.email', port: 995, secure: true },
// web: 'https://ethereal.email'


type ASendConfirmationEmail = {
  secret: string;
  to: string;
  username: string;
}
function nodemailerSendConfirmation({ secret, to, username }: ASendConfirmationEmail) {
  const host = "http://localhost:3000/";
  const address = "confirm_email/" + secret;
  transporter.sendMail({
    from: `${SITE_NAME} noreply@interdrill.com`,
    to: [to],
    subject: "Confirm your email",
    html: `
Hello ${username}!<br/>
<br/>
<p>To finish your registration please follow the link:</p>
<a target="_blank" href="${host + address}">Confirm my email</a>
`,
  });
}

export async function register(payload: ARegister) {
  const session = await getSession();
  const englishLevel = session.englishLevel;
  const result = await query(({ users }, { email, password, username, englishLevel }, { $, drill }) => {
    const whereEmail = users.where("email", email).limit(1).select(u => u.$id);
    if (whereEmail.length != 0) throw new $.ResponseError("email", "Already registered");
    const whereUsername = users.where("username", username).limit(1).select(u => u.$id);
    if (whereUsername.length != 0) throw new $.ResponseError("username", "Already taken");

    users.insert({
      englishLevel: englishLevel || "a0",
      username,
      email,
      password: $.encodePassword(password),
      emailVerified: false,
      knownWords: [],
      knownWordsVersion: new Date(0),
      fullName: "",
      image: "",
      wordsCount: 0,
    });
    const secret = drill.createEmailConfirmation(email);

    return {
      to: email,
      username,
      secret,
    }
  }, {
    ...payload,
    englishLevel,
  });
  nodemailerSendConfirmation(result);

  return true;
}

export type FRegister = typeof register;


////////////////////////////////////////////////////


export type RGetMyPage = {
  user: UserSelf | null;
}

export async function getMyPage(): Promise<RGetMyPage> {
  const session = await getSession();
  if (!session.user) return {
    user: null,
  };

  const user = await query(({ user_rights, users }, { id }, { drill, db }) => {
    if (!users.has(id)) return undefined;
    return drill.userSelf(users.at(id, u => u.$light()));
  }, { id: session.user.id });

  session.user = user;
  return {
    user: session.user || null,
  };

}

export type FGetMyPage = typeof getMyPage;
////////////////////////////////////////////////////




export async function repeatConfirmationEmail() {
  const { user } = await getSession();
  if (!user) throw new ResponseError("You must be signed in to perform this action");

  const secret = await query(({ }, { email }, { $, drill }) => {
    return drill.createEmailConfirmation(email);
  }, user);

  nodemailerSendConfirmation({
    secret,
    to: user.email,
    username: user.username,
  });
}

export type FRepeatConfirmationEmail = typeof repeatConfirmationEmail;
////////////////////////////////////////////////////



export async function confirmEmail(payload: AConfirmEmail) {
  const result = await query(({ users, email_confirmations }, { secret }) => {
    if (!email_confirmations.has(secret)) return false;
    const email = email_confirmations.at(secret, r => r.email);
    email_confirmations.where("secret", secret).delete();
    users.where("email", email).update(rec => {
      rec.emailVerified = true;
    });
    return email;
  }, payload);
  const session = await getSession();

  if (session.user && session.user.email == result) {
    session.user.emailVerified = true;
  }
  return result;
}

////////////////////////////////////////////////////


export async function updateUserInfo(payload: AUpdateUserInfo) {
  const session = await getSession();
  if (!session.user) throw new ResponseError("You must be signed in to perform this action");

  const { user, secret } = await query(({ users, user_rights, email_confirmations }, { newInfo, password, id }, { $, drill }) => {
    if (!users.has(id)) throw new $.ResponseError("User {...} doesn't exist", [id + ""]);

    const user = users.at(id, u => u.$light());
    if (password && $.encodePassword(password) != user.password) throw new $.ResponseError("password", "Incorrect password");

    const emailChanged = user.email != newInfo.email && !!newInfo.email;
    const usernameChanged = user.username != newInfo.username && !!newInfo.username;
    const passwordChanged = !(!newInfo.password || user.password == $.encodePassword(newInfo.password));
    const fullNameChanged = user.fullName != newInfo.fullName && newInfo.fullName !== undefined;
    const imageChanged = user.image != newInfo.image && newInfo.image !== undefined;

    const passwordRequired = emailChanged || passwordChanged && user.password;
    if (passwordRequired && !password)
      throw new $.ResponseError("Password is required");

    if (usernameChanged && users.indexIds("username", newInfo.username!).length)
      throw new $.ResponseError("username", "Already taken");

    if (emailChanged) {
      const found = users.where("email", newInfo.email!).limit(1).select(u => 1);
      if (found.length != 0) throw new $.ResponseError("email", "Already taken");
    }

    users.where("id", id).limit(1).update(user => {
      if (fullNameChanged) user.fullName = newInfo.fullName!;
      if (imageChanged) user.image = newInfo.image!;
      if (usernameChanged) user.username = newInfo.username!;
      if (passwordChanged) user.password = $.encodePassword(newInfo.password!);
      if (emailChanged) {
        user.email = newInfo.email!;
        user.emailVerified = false;
      }
    });

    const newUserInfo = drill.userSelf(users.at(id, u => u.$light()));
    let secret = "";
    if (emailChanged) {
      secret = drill.createEmailConfirmation(newUserInfo.email);
    }
    return {
      user: newUserInfo,
      secret,
    }
  }, {
    ...payload,
    id: session.user.id,
  });
  if (secret)
    nodemailerSendConfirmation({
      secret,
      to: user.email,
      username: user.fullName || user.username,
    });
  session.user = user;
  return user;
}

export type FUpdateUserInfo = typeof updateUserInfo;
////////////////////////////////////////////////////
