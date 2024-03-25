
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
    emailVerified: z.boolean(),
    englishLevel: z.enum(["a0", "a1", "a2", "b1", "b2", "c1", "c2"]),
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


export const test_questions = (table: Table, { z }: { z: typeof zod }) => {
  return z.object({
    correctAnswers: z.array(z.number()),
    difficulty: z.enum(["a1", "a2", "b1", "b2", "c1", "c2"]),
    options: z.array(z.array(z.string())),
    template: z.string(),
    word: z.string(),
    discussionId: z.number(),
  });
}

export type TestQuestion = zod.infer<ReturnType<typeof test_questions>>;


export const comments = (table: Table, { z }: { z: typeof zod }) => {
  return z.object({
    id: z.number(),
    text: z.string().min(1).max(255),
    date: z.date(),
    author: z.string(),
    guestNickName: z.string(),
    discussionId: z.number(),
    sessid: z.string(),
    authorLvl: z.enum(["", "a0", "a1", "a2", "b1", "b2", "c1", "c2"]),
  });
}

export type CommentFull = zod.infer<ReturnType<typeof comments>>;
