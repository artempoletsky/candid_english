import z from "zod";
import { TestSession } from "app/test/api/route";
import { UserFull, EmailConfirmation, TestQuestion, CommentFull, CompletedExam, Survey, UserRights } from "../kurgandb_admin/validation";
import { LanguageLevel } from "../../lib/language_levels";
import { zodGlobals } from "lib/zodGlobals";
import type { GlobalScope } from "@artempoletsky/kurgandb";
// import { logNextSide } from "./api/chat";
// import "./api/chat";
// import "../../socket/server";
// logNextSide("test");

export const SITE_NAME = "Intermediate Drill";


export type AuthData = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export type Session = {
  id: string;
  ip: string;
  activeEnglishTest?: TestSession;
  user?: UserSelf;
  authUser?: AuthData;
  englishLevel: z.infer<typeof zodGlobals.levelA0C2Empty>;
}

export const API_UPLOAD_IMAGE = "/api/image/";

export type { UserFull as UserFull };

export type { UserRights as UserRights };

export type UserSelf = Omit<UserLight, "password"> & UserRights & {
  isPasswordSet: boolean;
};

export type UserInsert = Omit<UserFull, "id">;

export type UserLight = Omit<UserFull, "knownWords">;

export type User = Omit<UserFull, "password" | "knownWords" | "knownWordsVersion" | "emailVerified">;

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


export type { TestQuestion as TestQuestion }
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




export type { CommentFull as CommentFull };

export type CommentInsert = Omit<CommentFull, "id">;

export type Commentary = {
  id: number;
  text: string;
  author: string;
  authorLvl: LanguageLevel | "";
  avatar: string;
  flags: (1 | 0)[];
  date: Date;
}

export const CommentingModes = ["guest", "registered", "emailVerified", "none"] as const;
export type CommentingMode = typeof CommentingModes[number];
export type CommentsMeta = {
  lastDiscussionId: number;
  commentingMode: CommentingMode;
};



export const ZPost = z.object({
  id: z.number(),
  date: z.date(),
  text: z.string(),
  cut: z.string(),
  author: z.string(),
  discussionId: z.number().int(),
});

export type Post = z.infer<typeof ZPost>;

export type PostInsert = Omit<Post, "id">;

export type PostLight = Omit<Post, "text">;

export type PostsMeta = {};

export type { EmailConfirmation as EmailConfirmation };


export type { CompletedExam as CompletedExam };
export type CompletedExamInsert = Omit<CompletedExam, "id">;
export type CompletedExamLight = Omit<CompletedExam, "answers">


export type { Survey as Survey };
export type SurveyInsert = Omit<Survey, "id">;
export type SurveyLight = Omit<Survey, "data">;

