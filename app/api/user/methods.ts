

import { ResponseError } from "@artempoletsky/easyrpc";

import { methodFactory, query } from "~/db";
import { AConfirmEmail, ARegister } from "./schemas";
import nodemailer, { Transporter } from "nodemailer";
import { AuthData, SITE_NAME, UserFull, UserLight, UserSelf } from "~/globals";
import { getSession } from "~/app/session/session";

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
test
<p>To finish your registration please follow the link:</p>
<a target="_blank" href="${host + address}">Confirm my email</a>
`,
  });
}

export const register = methodFactory(({ users, email_confirmations }, { email, password, username }: ARegister, { $ }) => {
  const whereEmail = users.where("email", email).limit(1).select(u => u.$id);
  if (whereEmail.length != 0) throw new $.ResponseError("email", "Already registered");
  const whereUsername = users.where("username", username).limit(1).select(u => u.$id);
  if (whereUsername.length != 0) throw new $.ResponseError("username", "Already taken");

  users.insert({
    username,
    email,
    password: $.encodePassword(password),
    emailConfirmed: false,
    knownWords: [],
    knownWordsVersion: new Date(0),
    fullName: "",
    image: "",
  });
  const buf = new Uint32Array(1);
  const rand = crypto.getRandomValues(buf)[0];
  const secret = $.md5(rand + email);
  email_confirmations.insert({
    email,
    secret,
  });

  return {
    to: email,
    username,
    secret,
  }
}, (result) => {

  nodemailerSendConfirmation(result);

  return true;
});
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

  const user = await query(({ user_rights, users }, { username }, { drill, db }) => {
    if (!users.has(username)) return undefined;
    return drill.userSelf(users.at(username, u => u.$light()));
  }, { username: session.user.username });

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

  const secret = await query(({ email_confirmations }, { email }, { $, drill }) => {
    email_confirmations.where("email", email).delete();

    const secret = drill.secret(email);

    email_confirmations.insert({
      secret,
      email,
    });
    return secret;
  }, user);

  nodemailerSendConfirmation({
    secret,
    to: user.email,
    username: user.username,
  });
}

export type FRepeatConfirmationEmail = typeof repeatConfirmationEmail;
////////////////////////////////////////////////////



export const confirmEmail = methodFactory(({ users, email_confirmations }, { secret }: AConfirmEmail) => {
  if (!email_confirmations.has(secret)) return false;
  const email = email_confirmations.at(secret, r => r.email);
  email_confirmations.where("secret", secret).delete();
  users.where("email", email).update(rec => {
    rec.emailConfirmed = true;
  });
  return email;
});
////////////////////////////////////////////////////
