
import { RecordValidator, Table } from "@artempoletsky/kurgandb/globals";
import zod from "zod";

export const users = (users: Table, { z }: { z: typeof zod }) => {
  return z.object({
    username: z.string(),
    email: z.string().email(),
    password: z.string(),
    fullName: z.string(),
    knownWords: z.array(z.string()),
    knownWordsVersion: z.coerce.date(),
    image: z.string(),
    emailConfirmed: z.boolean(),
  });
}

export type UserFull = zod.infer<ReturnType<typeof users>>;

export const email_confirmations = (table: Table, { z }: { z: typeof zod }) => {
  return z.object({
    secret: z.string(),
    email: z.string().email(),
  });
}

export type EmailConfirmation = zod.infer<ReturnType<typeof email_confirmations>>;
