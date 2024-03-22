import z from "zod";

export const register = z.object({
  username: z.string().min(1, "Required"),
  password: z.string().min(1, "Required"),
});
export type ARegister = z.infer<typeof register>;



export const getPage = z.object({});

