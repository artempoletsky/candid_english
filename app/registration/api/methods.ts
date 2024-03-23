

import { ResponseError } from "@artempoletsky/easyrpc";

import { methodFactory, query } from "~/db";
import { ARegister } from "./schemas";
import nodemailer, { Transporter } from "nodemailer";
import { SITE_NAME } from "~/globals";

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
    email,
    username,
    secret,
  }
}, ({ email, username, secret }) => {

  const host = "http://localhost:3000/";
  const address = "confirm_email/" + secret;
  transporter.sendMail({
    from: `${SITE_NAME} noreply@interdrill.com`,
    to: [email],
    subject: "Confirm your email",
    html: `
Hello ${username}!<br/>
<br/>
<p>To finish your registration please follow the link:</p>
<a href="${host + address}">Confirm my email</a>
`,
  });

  return true;
});
export type FRegister = typeof register;