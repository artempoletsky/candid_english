
import { GlobalScope } from "@artempoletsky/kurgandb";
import { RecordValidator, Table } from "@artempoletsky/kurgandb/globals";
import zod from "zod";
import { Plugins } from "./plugins";

type Scope = GlobalScope & Plugins;
export const users = (users: Table, { z, zodRules }: Scope) => {

  return z.object({
    id: z.number(),
    username: z.string(),
    email: z.string().email(),
    password: z.string(),
    fullName: z.string(),
    knownWords: z.array(z.string()),
    knownWordsVersion: z.coerce.date(),
    image: z.string(),
    emailVerified: z.boolean(),
    englishLevel: zodRules.levelA0C2,
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


export const test_questions = (table: Table, { z, zodRules }: Scope) => {
  return z.object({
    correctAnswers: z.array(z.number()),
    difficulty: zodRules.levelA1C1,
    options: z.array(z.array(z.string())),
    template: z.string(),
    word: z.string(),
    discussionId: z.number(),
    explanation: z.string(),
  });
}

export type TestQuestion = zod.infer<ReturnType<typeof test_questions>>;


export const comments = (table: Table, { z, zodRules }: Scope) => {
  return z.object({
    id: z.number(),
    text: z.string().min(1).max(255),
    date: z.date(),
    author: z.string(),
    guestNickName: z.string(),
    discussionId: z.number(),
    sessid: z.string(),
    authorLvl: zodRules.levelA0C2Empty,
  });
}

export type CommentFull = zod.infer<ReturnType<typeof comments>>;


export const completed_exams = (table: Table, { z, zodRules }: Scope) => {
  return z.object({
    id: z.number(),
    resultLevel: zodRules.levelA0C2,
    answers: z.array(z.object({
      questionId: z.string(),
      userAnswers: z.array(z.string()),
    })),
    surveyId: z.number(),
    sessid: z.string(),
    username: z.string(),
  });
}

export type CompletedExam = zod.infer<ReturnType<typeof completed_exams>>;

export const surveys = (table: Table, { z }: Scope) => {

  return z.object({
    id: z.number(),
    type: z.string(),
    data: z.record(z.string()),
    username: z.string(),
  });
}

export type Survey = zod.infer<ReturnType<typeof surveys>>;