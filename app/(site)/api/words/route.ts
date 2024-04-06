import { APIObject, NextPOST } from "@artempoletsky/easyrpc";
import * as rules from "./schemas_words";
import * as api from "./methods_words";

api satisfies APIObject<typeof rules>

export const dynamic = "force-dynamic";
export const POST = NextPOST(rules, api);