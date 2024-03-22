import z from "zod";
import { TestSession } from "./app/test/api/route";

export const ZUser = z.object({
  email: z.string(),
  username: z.string(),
  password: z.string(),
  fullName: z.string(),
  knownWords: z.any(),
  knownWordsVersion: z.date(),
  image: z.string(),
});

export type UserFull = z.infer<typeof ZUser>;

export type UserLight = Omit<UserFull, "knownWords">;

export type User = Omit<UserFull, "password" | "knownWords" | "knownWordsVersion">;

export type UsersMeta = {};



export const ZArray = z.object({
  name: z.string(),
  data: z.any(),
});

export type Array = z.infer<typeof ZArray>;

export type ArrayLight = Omit<Array, "data">;

export type ArraysMeta = {};



export const ZTestWord = z.object({
  id: z.string(),
  level: z.string(),
  oxfordLevel: z.string(),
  part: z.string(),
  word: z.string(),
});

export type TestWord = z.infer<typeof ZTestWord>;

export type TestWordsMeta = {};



export const ZSynonym = z.object({
  word: z.string(),
  data: z.any(),
});

export type Synonym = z.infer<typeof ZSynonym>;

export type SynonymsMeta = {};



export const ZTestQuestion = z.object({
  correctAnswers: z.any(),
  difficulty: z.string(),
  options: z.any(),
  template: z.string(),
  word: z.string(),
});

export type TestQuestion = z.infer<typeof ZTestQuestion>;

export type TestQuestionsMeta = {};



export const ZFrequency5000 = z.object({
  word: z.string(),
  rank: z.number(),
  frequency: z.number(),
  part: z.string(),
  inflections: z.string(),
});

export type Frequency5000 = z.infer<typeof ZFrequency5000>;

export type Frequency5000sMeta = {};



export const ZLemmatizerProposition = z.object({
  id: z.number(),
  username: z.string(),
  session_id: z.string(),
  sentence: z.string(),
  word: z.string(),
  proposition: z.string(),
  reviewed: z.boolean(),
  oldLemma: z.string(),
});

export type LemmatizerProposition = z.infer<typeof ZLemmatizerProposition>;

export type LemmatizerPropositionInsert = Omit<LemmatizerProposition, "id">;

export type LemmatizerPropositionsMeta = {};



export const ZUserRight = z.object({
  id: z.string(),
  isAdmin: z.boolean(),
  isModerator: z.boolean(),
});

export type UserRight = z.infer<typeof ZUserRight>;

export type UserRightsMeta = {};



export const ZComment = z.object({
  id: z.number(),
  text: z.string(),
  date: z.date(),
  parentType: z.string(),
  parentTypeID: z.string(),
  author: z.string(),
  guestNickName: z.string(),
});

export type Comment = z.infer<typeof ZComment>;

export type CommentInsert = Omit<Comment, "id">;

export type CommentsMeta = {};



export const ZPost = z.object({
  id: z.number(),
  date: z.date(),
  text: z.string(),
  cut: z.string(),
  author: z.string(),
});

export type Post = z.infer<typeof ZPost>;

export type PostInsert = Omit<Post, "id">;

export type PostLight = Omit<Post, "text">;

export type PostsMeta = {};



export const SITE_NAME = "Intermediate Drill";


export type AuthData = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}
export type Session = {
  id: string
  isAdmin: boolean
  activeEnglishTest?: TestSession
  user?: UserLight,
  authUser?: AuthData,
}
