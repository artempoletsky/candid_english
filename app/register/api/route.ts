import { NextPOST } from "@artempoletsky/easyrpc";
import { NextResponse } from "next/server";
import * as schemas from "./schemas";
import * as api from "./methods";


export const POST = NextPOST(NextResponse, schemas, api);

