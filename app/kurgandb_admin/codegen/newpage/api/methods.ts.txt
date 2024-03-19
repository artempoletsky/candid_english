import { ResponseError } from "@artempoletsky/easyrpc";
import type { ASayHello, ARegister } from "./schemas";
import { methodFactory, query } from "@/db";


export async function sayHello({ name }: ASayHello) {
  if (name == "")
    throw new ResponseError("Name is empty!");

  return `Hello, ${name}!`;
}
export type FSayHello = typeof sayHello;
////////////////////////////////////////////////////


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



export const getPageData = methodFactory(({ }, { }, { db }) => {
  return db.versionString;
});

export type FGetPageData = () =>  ReturnType<typeof getPageData>;
////////////////////////////////////////////////////
