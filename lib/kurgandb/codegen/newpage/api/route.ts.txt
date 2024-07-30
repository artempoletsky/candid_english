import { NextPOST } from "@artempoletsky/easyrpc";
import * as schemas from "./schemas";
import * as api from "./methods";


export const POST = NextPOST(schemas, api);

