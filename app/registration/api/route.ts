import { NextPOST } from "@artempoletsky/easyrpc";
import { NextResponse } from "next/server";

import z from "zod";
import { ResponseError } from "@artempoletsky/easyrpc";

import { methodFactory, query } from "~/db";

const ZRegister = z.object({

});
export type ARegister = z.infer<typeof ZRegister>;

async function register(params: ARegister) {

}
export type FRegister = typeof register;

export const POST = NextPOST(NextResponse, {
  register: ZRegister,
}, {
  register,
});

