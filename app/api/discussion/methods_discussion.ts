import { ResponseError } from "@artempoletsky/easyrpc";
import type { AGetDiscussion, AGetTicketDiscussion, APostComment } from "./schemas";
import { methodFactory, query } from "app/db";
import { getSession } from "app/session/session";
import { User, UserLight, Commentary } from "app/globals";
import { decryptId } from "lib/aes";


export async function postComment(payload: APostComment): Promise<Commentary> {
  const session = await getSession();
  // console.log(session);

  return await query(({ comments, users }, { user, sessid, guestName, text, discussionId, englishLevel, ip }, { $, drill, txt }) => {
    const { commentingMode } = comments.meta;
    if (commentingMode == "none") throw new $.ResponseError("Commenting is temporary turned off");
    if (commentingMode != "guest" && !user) throw new $.ResponseError("Only registered users can post comments");
    let dbUser: UserLight | undefined;
    if (commentingMode == "emailVerified") {
      dbUser = users.at(user!.id, u => u.$light());
      if (!dbUser.emailVerified) throw new $.ResponseError("Only users with verified email can post comments");
    }
    if (user && !dbUser) dbUser = users.at(user!.id, u => u.$light());

    const toInsert = {
      authorLvl: dbUser ? dbUser.englishLevel : englishLevel,
      author: dbUser ? dbUser.username : "",
      date: new Date(),
      discussionId,
      originalText: text,
      html: txt.prepareComment(text),
      guestNickName: guestName || "",
      sessid,
      ip,
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
    ip: session.ip,
  });
}
export type FPostComment = typeof postComment;
////////////////////////////////////////////////////

export async function getTicketDiscussion({ encryptedDiscussionId }: AGetTicketDiscussion) {

  const discussionId = decryptId(encryptedDiscussionId);
  if (Number.isNaN(discussionId))
    throw new ResponseError({
      message: "Not found",
      statusCode: 404,
    });

  return await query(({ test_questions }, { discussionId }, { $, drill }) => {
    const ticket = test_questions.where("discussionId", discussionId).limit(1).select()[0];
    if (!ticket) throw new $.ResponseError({
      message: "Not found",
      statusCode: 404,
    });

    const comments = drill.getComments(discussionId);
    return { ticket, comments };
  }, { discussionId });

}

export type FGetTicketDiscussion = typeof getTicketDiscussion;
export type RGetTicketDiscussion = Awaited<ReturnType<FGetTicketDiscussion>>;


export const getDiscussion = methodFactory((({ test_questions }, { discussionId }: AGetDiscussion, { $, drill }) => {
  const ticket = test_questions.where("discussionId", discussionId).limit(1).select()[0];
  if (ticket) throw new $.ResponseError("not allowed");

  return drill.getComments(discussionId);
}));
export type FGetDiscussion = typeof getDiscussion;
