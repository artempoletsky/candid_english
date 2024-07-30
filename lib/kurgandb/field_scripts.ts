
import { RPC } from "@artempoletsky/easyrpc/client";

import { API_ENDPOINT } from "../../app/kurgandb/generated";
import { FieldScriptsObject, adminRPCCustom } from "../../app/kurgandb/globals";
import { encodePassword } from "@artempoletsky/kurgandb/globals";
import { TestQuestion, UserFull } from "app/globals";

const { getFreeDiscussionId } = adminRPCCustom().methods("getFreeDiscussionId");

const discussionId = {
  Get_free(record: any) {
    getFreeDiscussionId({}).then(id => {
      console.log(id);

      record.discussionId = id;
    });
  }
}

export const fieldScripts: FieldScriptsObject = {
  users: { // the name of the table
    password: {
      Encode(record: UserFull) {
        record.password = encodePassword(record.password);
      }
    }
  },
  test_questions: {
    discussionId,
    explanation: {
      Oxford(rec: TestQuestion) {
        rec.explanation += `<a 
target="_blank" 
href="https://www.oxfordlearnersdictionaries.com/definition/english/${rec.word.replaceAll(" ", "-")}">${rec.word}</a>`;
      }
    }
  },
  posts: {
    discussionId,
  },
}
