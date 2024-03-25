import { CallbackScope } from "@artempoletsky/kurgandb";
import { PluginFactory, Table } from "@artempoletsky/kurgandb/globals";
import { EmailConfirmation, UserLight, UserRights, UserSelf } from "~/globals";

export const drill = function name({ db, $, _, z }: CallbackScope) {
  const user_rights: Table<UserRights, string> = db.getTable("user_rights");
  const email_confirmations: Table<EmailConfirmation, string> = db.getTable("email_confirmations");
  const DefaultRights = user_rights.getRecordDraft() as Omit<UserRights, "username">;
  delete (DefaultRights as any)["username"];

  return {
    userSelf(user: UserLight): UserSelf {
      const { username } = user;
      const { password, ...userNoPwd } = user;
      if (user_rights.has(username)) {
        return {
          ...user_rights.at(username),
          ...userNoPwd,
        }
      }
      return {
        ...DefaultRights,
        ...userNoPwd,
      }
    },
    secret(value: string) {
      const buf = new Uint32Array(1);
      const rand = crypto.getRandomValues(buf)[0];
      return $.md5(rand + value);
    },
    createEmailConfirmation(email: string) {
      email_confirmations.where("email", email).delete();

      const secret = this.secret(email);

      email_confirmations.insert({
        secret,
        email,
      });
      return secret;
    }
  }
}

export type Plugins = {
  drill: ReturnType<typeof drill>;
}