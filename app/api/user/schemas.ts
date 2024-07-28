import z from "zod";

import { zodGlobals as r } from "lib/zodGlobals";

export const register = z.object({
  email: r.email,
  username: r.username,
  password: r.password,
  passwordConfirmation: r.password,
}).superRefine(({ password, passwordConfirmation }, ctx) => {
  if (password != passwordConfirmation) {
    ctx.addIssue({
      code: "custom",
      fatal: true,
      path: ["passwordConfirmation"],
      message: "Passwords don't match",
    });
    ctx.addIssue({
      code: "custom",
      fatal: true,
      path: ["password"],
      message: "Passwords don't match",
    });
  }
});

export type ARegister = z.infer<typeof register>;


export const getMyPage = z.object({});
export const repeatConfirmationEmail = z.object({});

export const confirmEmail = z.object({
  secret: z.string(),
});
export type AConfirmEmail = z.infer<typeof confirmEmail>;

export const updateUserInfo = z.object({
  password: r.password.optional(),
  newInfo: z.object({
    email: r.email,
    username: r.username,
    fullName: z.string(),
    image: z.string(),
    password: r.password,
  }).partial(),
});

export type AUpdateUserInfo = z.infer<typeof updateUserInfo>;
