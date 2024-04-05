import { NextPOST, ValidationRule, Validator, commonArraysEqualLength, validateArrayUnionFabric } from "@artempoletsky/easyrpc";
import { NextResponse } from "next/server";
import { TestWord, noPayloadQueryMethod, query } from "~/db";

const EDITABLE_FIELDS = ["part", "level"] as const;

type AChangeField = Record<string, Record<string, string>>;

const validateChangeField: Validator<AChangeField> = async ({ args }) => {
  for (const id in args) {
    for (const field in args[id]) {
      if (!EDITABLE_FIELDS.includes(<any>field)) {
        return `Field '${field}' is not an editable field`;
      }
    }
  }
  return true;
}

const VChangeField: ValidationRule<AChangeField> = [
  validateChangeField
]

async function changeField(args: AChangeField) {

  await query<AChangeField>(({ test_words }, { payload }) => {
    test_words.where("id", ...Object.keys(payload)).update(doc => {
      const fields = payload[doc.id];
      for (const f in fields) {
        doc.set(<any>f, fields[f]);
      }
    });
  }, args);
  return {
    message: "OK"
  }
}


export const getTestWords: () => Promise<TestWord[]> = noPayloadQueryMethod(({ test_words }, { }) => {
  return test_words.all().limit(0).select();
});

export type FChangeField = typeof changeField;

const API = {
  changeField,
  getTestWords,
};

export type API = typeof API;

export const POST = NextPOST({
  changeField: VChangeField,
  getTestWords: {},
}, API);