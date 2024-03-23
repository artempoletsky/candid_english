import { NextPOST } from "@artempoletsky/easyrpc";

import * as api from "./methods";
import * as rules from "./schemas";

export const POST = NextPOST(rules, api);

