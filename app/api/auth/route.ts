import { NextPOST } from "@artempoletsky/easyrpc";
import { NextResponse } from "next/server";
import z from "zod";
import * as api from "./methods";


export const POST = NextPOST(NextResponse, {
  logout: z.object({}),
}, api);