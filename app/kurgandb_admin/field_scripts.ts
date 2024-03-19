
import { getAPIMethod } from "@artempoletsky/easyrpc/client";
import type { FExapleCustomMethod } from "./api";
import { API_ENDPOINT } from "../kurgandb/generated";
import { FieldScriptsObject } from "../kurgandb/globals";
import { encodePassword } from "@artempoletsky/kurgandb/globals";


const exampleCustomMethod = getAPIMethod<FExapleCustomMethod>(API_ENDPOINT, "exampleCustomMethod");

type UserFull = { username: string, password: string };
export const fieldScripts: FieldScriptsObject = {
  users: { // the name of the table
    username: { // the name of the field
      Reverse(record: UserFull) {
        exampleCustomMethod({
          arg: record.username
        }).then(reversed => {
          record.username = reversed;
        })
      },
      Script() {

      },
    },
    password: {
      Encode(record: UserFull) {
        record.password = encodePassword(record.password);
      }
    }
  }
}
