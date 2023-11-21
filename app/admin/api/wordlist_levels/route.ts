import { NextRequest, NextResponse } from "next/server";
import { OXFORD_LIST_LIGHT, OXFORD_LEVEL_PATCH } from "~/lib/paths";
import { createIfNotExists, rfs, wfs } from "~/lib/util";

import { existsSync } from "fs";

type OxfordEntry = {
  id: string
  word: string
  part: string
  level: string
};


type ModifiedOxfordList = Record<string, {
  word: string
  part: string
  level: string
  originalLevel: string
}>;

export async function GET(req: NextRequest) {

  createIfNotExists(OXFORD_LEVEL_PATCH, {});
  const listLight: OxfordEntry[] = rfs(OXFORD_LIST_LIGHT);
  const modified: Record<string, string> = rfs(OXFORD_LEVEL_PATCH);
  const result: ModifiedOxfordList = {};
  for (const entry of listLight) {
    const id: string = entry.word.toLowerCase();
    result[id] = {
      word: entry.word,
      part: entry.part,
      level: modified[id] || entry.level,
      originalLevel: entry.level,
    };
  }

  return NextResponse.json(result, {
    status: 200
  });
}

function changeLevel(ids: string[], levels: string[]) {
  const listLight: OxfordEntry[] = rfs(OXFORD_LIST_LIGHT);
  const patch: Record<string, string> = rfs(OXFORD_LEVEL_PATCH);

  for (const e of listLight) {
    const id = e.word.toLowerCase();
    const i = ids.indexOf(id);
    if (i == -1) continue;
    const level = levels[i];
    if (level == e.level) {
      delete patch[id];
      continue;
    }
    patch[id] = level;
  }

  wfs(OXFORD_LEVEL_PATCH, patch, {
    pretty: true
  });
}

export async function PATCH(req: NextRequest) {
  let { method, ...args } = await req.json();
  if (method == "changeLevel") {
    if (!args.ids || !args.levels) {
      return NextResponse.json({
        message: `Missing arguments, expected: {ids: string[], levels: string[]}`
      }, {
        status: 403
      });
    }

    try {
      changeLevel(args.ids, args.levels);

    } catch (error) {
      return NextResponse.json({
        message: error + ""
      }, {
        status: 500
      });
    }
  } else {
    return NextResponse.json({
      message: `Method "${method}" doesn't exist`
    }, {
      status: 403
    });
  }

  return NextResponse.json({
    message: "OK"
  }, {
    status: 200
  });
}