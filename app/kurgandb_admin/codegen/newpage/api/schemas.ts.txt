import z from "zod";


export const sayHello = z.object({
  name: z.string()
});
export type ASayHello = z.infer<typeof sayHello>;


export const register = z.object({
  username: z.string().min(1, "Required"),
  password: z.string().min(1, "Required"),
});
export type ARegister = z.infer<typeof register>;

