import { Predicate, queryUniversal } from "@artempoletsky/kurgandb";
import type { PlainObject, Table } from "@artempoletsky/kurgandb/globals";
import type * as types from "./globals";
import { Plugins } from "lib/kurgandb/plugins";


export type Tables = {
  users: Table<
    types.UserFull,
    number,
    types.UsersMeta,
    types.UserInsert,
    types.UserLight,
    types.User
  >;
  arrays: Table<
    types.Array,
    string,
    types.ArraysMeta,
    types.Array,
    types.ArrayLight
  >;
  test_words: Table<
    types.TestWord,
    string,
    types.TestWordsMeta
  >;
  synonyms: Table<
    types.Synonym,
    string,
    types.SynonymsMeta
  >;
  test_questions: Table<
    types.TestQuestion,
    string,
    types.TestQuestionsMeta
  >;
  frequency5000: Table<
    types.Frequency5000,
    string,
    types.Frequency5000sMeta
  >;
  lemmatizer_propositions: Table<
    types.LemmatizerProposition,
    number,
    types.LemmatizerPropositionsMeta,
    types.LemmatizerPropositionInsert
  >;
  user_rights: Table<
    types.UserRights,
    number
  >;
  comments: Table<
    types.CommentFull,
    number,
    types.CommentsMeta,
    types.CommentInsert
  >;
  email_confirmations: Table<
    types.EmailConfirmation,
    string
  >;
  completed_exams: Table<
    types.CompletedExam,
    number,
    {},
    types.CompletedExamInsert,
    types.CompletedExamLight
  >;
  surveys: Table<
    types.Survey
    , number
    , {}
    , types.SurveyInsert
    , types.SurveyLight
  >;
  articles: Table<
    types.ArticleFull
    , string
    , {}
    , types.ArticleFull
    , types.ArticleLight
    , types.Article
  >
};


export async function query<Payload extends PlainObject, ReturnType>(predicate: Predicate<Tables, Payload, ReturnType, Plugins>, payload?: Payload) {
  return queryUniversal<Payload, ReturnType, Tables, Plugins>(predicate, payload);
}


export function methodFactory<Payload extends PlainObject, PredicateReturnType, ReturnType = PredicateReturnType>(predicate: Predicate<Tables, Payload, PredicateReturnType, Plugins>, then?: (dbResult: PredicateReturnType) => ReturnType) {
  return async function (payload: Payload) {
    const dbResult = await query(predicate, payload);
    if (!then) return dbResult as ReturnType;
    return then(dbResult) as ReturnType;
  }
}
