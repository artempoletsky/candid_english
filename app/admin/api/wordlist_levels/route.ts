import { NextRequest, NextResponse } from "next/server";
import { ValidationRule, commonArraysEqualLength, validateArrayUnionFabric, NextPOST } from "@artempoletsky/easyrpc";
import { OXFORD_LIST_LIGHT, OXFORD_LEVEL_PATCH, OXFORD_PART_PATCH } from "~/lib/paths";
import { createIfNotExists, rfs, wfs } from "~/lib/util";
import { LanguageLevel } from "~/lib/language_levels";



type OxfordEntry = {
  id: string
  word: string
  part: string
  level: LanguageLevel
};


export type ModifiedOxfordList = Record<string, {
  word: string
  part: string
  level: LanguageLevel
  originalLevel: LanguageLevel
}>;

export function getList(): ModifiedOxfordList {
  createIfNotExists(OXFORD_LEVEL_PATCH, {});
  createIfNotExists(OXFORD_PART_PATCH, {});
  const listLight: OxfordEntry[] = rfs(OXFORD_LIST_LIGHT);
  const levelPatch: Record<string, LanguageLevel> = rfs(OXFORD_LEVEL_PATCH);
  const partPatch: Record<string, string> = rfs(OXFORD_PART_PATCH);
  const result: ModifiedOxfordList = {};
  for (const entry of listLight) {
    const id: string = entry.word.toLowerCase();
    if (result[id] && result[id].originalLevel < entry.level) {
      continue;
    }
    result[id] = {
      word: entry.word,
      level: levelPatch[id] || entry.level,
      part: partPatch[id] || entry.part,
      originalLevel: entry.level,
    };
  }
  return result;
}

export async function GET(req: NextRequest) {

  return NextResponse.json(getList(), {
    status: 200
  });
}


const EDITABLE_FIELDS = ["part", "level"] as const;

type ArgChangeField = {
  ids: string[],
  values: string[],
  fields: typeof EDITABLE_FIELDS[number][]
}

const VChangeField: ValidationRule<ArgChangeField> = [
  {
    ids: "string[]",
    values: "string[]",
    fields: validateArrayUnionFabric(EDITABLE_FIELDS)
  },
  commonArraysEqualLength(["ids", "values", "fields"])
]


async function changeField({ ids, values, fields }: ArgChangeField) {
  const listLight: OxfordEntry[] = rfs(OXFORD_LIST_LIGHT);
  const levelPatch: Record<string, string> = rfs(OXFORD_LEVEL_PATCH);
  const partPatch: Record<string, string> = rfs(OXFORD_PART_PATCH);

  for (const e of listLight) {
    const id = e.word.toLowerCase();
    const i = ids.indexOf(id);
    if (i == -1) continue;
    const field = fields[i];
    const value = values[i];
    const originalValue = (e as any)[field];
    let patch: Record<string, string> = {};

    if (field == "part") {
      patch = partPatch;
    } else if (field == "level") {
      patch = levelPatch;
    }

    if (value == originalValue) {
      delete patch[id];
      continue;
    }
    patch[id] = value;
  }

  wfs(OXFORD_LEVEL_PATCH, levelPatch, {
    pretty: true
  });
  wfs(OXFORD_PART_PATCH, partPatch, {
    pretty: true
  });
  return {
    message: "OK"
  }
}


export const POST = NextPOST(NextResponse, {
  changeField: VChangeField
}, {
  changeField,
});