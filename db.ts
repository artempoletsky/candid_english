import { Predicate, queryUniversal } from "@artempoletsky/kurgandb";
import type { PlainObject, Table } from "@artempoletsky/kurgandb/globals";
import type * as types from "./globals";


export type Tables = {
  users: Table<
    types.UserFull,
    string,
    types.UsersMeta,
    types.UserFull,
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
    types.UserRight,
    string,
    types.UserRightsMeta
  >;
  comments: Table<
    types.Comment,
    number,
    types.CommentsMeta,
    types.CommentInsert
  >;
  posts: Table<
    types.Post,
    number,
    types.PostsMeta,
    types.PostInsert,
    types.PostLight
  >;
};


export async function query<Payload extends PlainObject, ReturnType>(predicate: Predicate<Tables, Payload, ReturnType>, payload?: Payload) {
  return queryUniversal<Payload, ReturnType, Tables>(predicate, payload);
}


export function methodFactory<Payload extends PlainObject, PredicateReturnType, ReturnType = PredicateReturnType>(predicate: Predicate<Tables, Payload, PredicateReturnType>, then?: (dbResult: PredicateReturnType) => ReturnType) {
  return async function (payload: Payload) {
    const dbResult = await query(predicate, payload);
    if (!then) return dbResult;
    return then(dbResult);
  }
}
