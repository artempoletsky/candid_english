import { NextPOST } from "@artempoletsky/easyrpc";

import * as api from "./methods";
import * as rules from "./schemas";
import { z } from "zod";

// export const POST = NextPOST(rules, api);

export const POST = NextPOST({
  register: rules.register,
  getMyPage: rules.getMyPage,
  updateUserInfo: rules.updateUserInfo,
  repeatConfirmationEmail: rules.repeatConfirmationEmail,
  confirmEmail: rules.confirmEmail,
}, api);

