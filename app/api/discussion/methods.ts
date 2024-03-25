import { ResponseError } from "@artempoletsky/easyrpc";
import type { AGetDiscussion, APostComment } from "./schemas";
import { methodFactory, query } from "~/db";
import { getSession } from "~/app/session/session";
import { User, UserLight, Comment } from "~/globals";


export async function postComment(payload: APostComment): Promise<Comment> {
  const session = await getSession();
  console.log(session);
  
  return await query(({ comments, users }, { user, sessid, guestName, text, discussionId, englishLevel }, { $, drill }) => {
    const { commentingMode } = comments.meta;
    if (commentingMode == "none") throw new ResponseError("Commenting is temporary turned off");
    if (commentingMode != "guest" && !user) throw new ResponseError("Only registered users can post comments");
    let dbUser: UserLight | undefined;
    if (commentingMode == "emailVerified") {
      dbUser = users.at(user!.username, u => u.$light());
      if (!dbUser.emailVerified) throw new ResponseError("Only users with verified email can post comments");
    }
    if (user && !dbUser) dbUser = users.at(user!.username, u => u.$light());

    const toInsert = {
      authorLvl: dbUser ? dbUser.englishLevel : englishLevel,
      author: dbUser ? dbUser.username : "",
      date: new Date(),
      discussionId,
      text,
      guestNickName: guestName || "",
      sessid,
    };
    const id = comments.insert(toInsert);

    const comment = drill.commentByUser({
      ...toInsert,
      id,
    }, dbUser);
    return comment;
  }, {
    ...payload,
    englishLevel: session.englishLevel,
    user: session.user,
    sessid: session.id,
  });
}
export type FPostComment = typeof postComment;
////////////////////////////////////////////////////

export const getTicketDiscussion = methodFactory((({ test_questions }, { discussionId }: AGetDiscussion, { $, drill }) => {

  const ticket = test_questions.where("discussionId", discussionId).limit(1).select()[0];
  if (!ticket) throw new $.ResponseError({
    message: "Not found",
    statusCode: 404,
  });

  const comments = drill.getComments(discussionId);
  return { ticket, comments };
}));

export type FGetTicketDiscussion = typeof getTicketDiscussion;
export type RGetTicketDiscussion = Awaited<ReturnType<FGetTicketDiscussion>>;