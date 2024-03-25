import z from "zod";

export const zUsername = z.string().min(5, "At least 5 symbols");
export const zPassword = z.string().min(5, "At least 5 symbols");
export const zEmail = z.string().email();

export const register = z.object({
  email: zEmail,
  username: zUsername,
  password: zPassword,
  passwordConfirmation: zPassword,
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
  password: zPassword.optional(),
  newInfo: z.object({
    email: zEmail,
    fullName: z.string(),
    image: z.string(),
    password: zPassword,
  }).partial(),
});

export type AUpdateUserInfo = z.infer<typeof updateUserInfo>;
