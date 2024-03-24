import { CallbackScope } from "@artempoletsky/kurgandb";
import { PluginFactory, Table } from "@artempoletsky/kurgandb/globals";
import { UserLight, UserRights, UserSelf } from "~/globals";

export const drill = function name({ db, $, _, z }: CallbackScope) {
  const user_rights: Table<UserRights, string> = db.getTable("user_rights");
  const DefaultRights = user_rights.getRecordDraft() as Omit<UserRights, "username">;
  delete (DefaultRights as any)["username"];

  return {
    userSelf(user: UserLight): UserSelf {
      const { username } = user;
      if (user_rights.has(username)) {
        return {
          ...user_rights.at(username),
          ...user,
        }
      }
      return {
        ...DefaultRights,
        ...user,
      }
    },
    secret(value: string) {
      const buf = new Uint32Array(1);
      const rand = crypto.getRandomValues(buf)[0];
      return $.md5(rand + value);
    }
  }
}

export type Plugins = {
  drill: ReturnType<typeof drill>;
}