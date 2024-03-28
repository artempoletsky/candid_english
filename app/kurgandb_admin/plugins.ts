import { CallbackScope } from "@artempoletsky/kurgandb";
import { Tables } from "app/db";
import {
  Commentary,
  CommentFull,
  User,
  UserLight,
  UserRights,
  UserSelf,
} from "app/globals";

export const drill = function name({ db, $, _, z }: CallbackScope) {
  const t: Tables = db.getTables() as Tables;
  const DefaultRights = t.user_rights.getRecordDraft() as Omit<UserRights, "username">;
  delete (DefaultRights as any)["username"];

  function createComment(c: CommentFull, author?: UserSelf): Commentary {
    const flags: (1 | 0)[] = [
      author ? 1 : 0,
      author && author.isAdmin ? 1 : 0,
      author && author.isModerator ? 1 : 0,
    ];
    return {
      authorLvl: c.authorLvl,
      id: c.id,
      author: author ? author.username : c.guestNickName,
      avatar: author ? author.image : "",
      date: c.date,
      flags,
      text: c.text,
    };
  }
  return {
    userSelf(user: UserLight): UserSelf {
      const { username } = user;
      const { password, ...userNoPwd } = user;
      if (t.user_rights.has(username)) {
        return {
          ...t.user_rights.at(username),
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
      t.email_confirmations.where("email", email).delete();

      const secret = this.secret(email);

      t.email_confirmations.insert({
        secret,
        email,
      });
      return secret;
    },
    getComments(discussionId: number): Commentary[] {
      const commentsRaw = t.comments.where("discussionId", discussionId).limit(0).select();
      const result: Commentary[] = [];
      const userIds = new Set<string>();
      for (const c of commentsRaw) {
        userIds.add(c.author);
      }
      userIds.delete("");
      const discussionUsers = t.users.where("username", ...Array.from(userIds)).limit(0).select();
      const usersDict = $.reduceDictionary<User, UserSelf>(discussionUsers, (res, user) => {
        res[user.username] = this.userSelf(user as UserLight);
      });

      for (const c of commentsRaw) {
        result.push(createComment(c, usersDict[c.author]));
      }
      return result;
    },
    commentByUser(commentRaw: CommentFull, author: User | undefined): Commentary {
      return createComment(commentRaw, author ? this.userSelf(author as UserLight) : undefined);
    },
  }
}

export type Plugins = {
  drill: ReturnType<typeof drill>;
}