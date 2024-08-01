import { FieldType, PlainObject } from "@artempoletsky/kurgandb/globals";
import fs from "fs";
import generateDB from "./codegen/db/generate_db";
import generateCodeFile from "./codegen/generate";
import { methodFactory, query } from "app/db";


export const Fix_comments = methodFactory(({ comments }, { }, { txt }) => {
  comments.all().update(c => {
    c.html = txt.prepareComment(c.originalText);
  });
  return "done";
});