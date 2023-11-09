import { NextRequest, NextResponse } from "next/server";
import { OXFORD_LIST_LIGHT } from "~/lib/paths";
import { rfs } from "~/lib/util";


export async function GET(req: NextRequest) {

  return NextResponse.json(rfs(OXFORD_LIST_LIGHT), {
    status: 200
  });
}