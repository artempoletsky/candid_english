import { methodFactory } from "~/db";


export const confirmEmail = methodFactory(({ users, email_confirmations }, { secret }: { secret: string }) => {
  if (!email_confirmations.has(secret)) return false;
  const email = email_confirmations.at(secret, r => r.email);
  email_confirmations.where("secret", secret).delete();
  users.where("email", email).update(rec => {
    rec.emailConfirmed = true;
  });
  return email;
});