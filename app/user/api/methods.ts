import { ResponseError } from "@artempoletsky/easyrpc";
import type { ARegister } from "./schemas";
import { methodFactory, query } from "~/db";
import { getSession } from "~/app/session/session";



export const register = methodFactory(({ users }, { username, password }: ARegister, { $ }) => {
  const draft = users.getRecordDraft();
  users.insert({
    ...draft,
    username,
    password: $.encodePassword(password),
  });
  return users.at(username);
}, (user) => {
  // send email confirmation letter
  return user;
});
export type FRegister = typeof register;
////////////////////////////////////////////////////



export async function getPage() {
  const session = await getSession();
  return session;
}

export type FGetPage = () => ReturnType<typeof getPage>;
////////////////////////////////////////////////////