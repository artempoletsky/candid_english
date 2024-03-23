
import { getAPIMethod } from "@artempoletsky/easyrpc/client";

import { API_ENDPOINT } from "../kurgandb/generated";
import { FieldScriptsObject } from "../kurgandb/globals";
import { encodePassword } from "@artempoletsky/kurgandb/globals";


// const exampleCustomMethod = getAPIMethod<FExapleCustomMethod>(API_ENDPOINT, "exampleCustomMethod");

type UserFull = { username: string, password: string };
export const fieldScripts: FieldScriptsObject = {
  users: { // the name of the table
    password: {
      Encode(record: UserFull) {
        record.password = encodePassword(record.password);
      }
    }
  }
}
