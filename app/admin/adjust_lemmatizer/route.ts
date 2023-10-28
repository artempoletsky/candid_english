
import { NextRequest, NextResponse } from "next/server";
import simplify from "~/lib/simplify_words";
import { rfs, wfs } from "~/lib/util";
import { LemmatizerBlacklist, LemmatizerWhitelist, LemmatizerOverrides } from '~/lib/paths';

const CWD = process.cwd();


export function addOverride({
  word,
  lemma
}: Record<string, string>) {
  const overrides: Record<string, string> = rfs(LemmatizerOverrides);
  overrides[word.toLowerCase()] = lemma.toLowerCase();
  wfs(LemmatizerOverrides, overrides, {
    pretty: true
  });
};


export function addToList({
  word,
  listType
}: Record<string, string>) {
  if (listType != "black" && listType != "white") {
    throw new Error(`'listType' can be only "black" or "white"`);
  }

  const filename = listType == "white" ? LemmatizerWhitelist: LemmatizerBlacklist;

  const list: string[] = rfs(filename);
  word = word.toLowerCase();

  if (list.includes(word)) return;
  list.push(word);
  wfs(filename, list, {
    pretty: true
  });
};

const Methods: Record<string, Function> = {
  addOverride,
  addToList
};

export async function POST(req: NextRequest) {
  // const reqBody = await req.json();
  let { method, ...args } = await req.json();

  if (!Methods[method]) {
    return NextResponse.json({
      message: `Method "${method}" doesn't exist`
    }, {
      status: 403
    });
  }
  let res;
  try {
    res = Methods[method](args) || {
      message: "OK"
    };
  } catch (error) {
    return NextResponse.json({
      message: error + ""
    }, {
      status: 403
    });
  }

  simplify();
  return NextResponse.json(res, {
    status: 200
  });
}