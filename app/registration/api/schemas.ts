import z from "zod";


export const register = z.object({
  email: z.string().email(),
  username: z.string().min(5, "At least 5 symbols"),
  password: z.string().min(5, "At least 5 symbols"),
  passwordConfirmation: z.string().min(5, "At least 5 symbols"),
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