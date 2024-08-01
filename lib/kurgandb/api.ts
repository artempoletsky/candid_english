import { ResponseError } from "@artempoletsky/easyrpc";
import z from "zod";
import { query, methodFactory } from "app/db";

import { removeExamTicketImage } from "../../app/api/image/methods_image";
import { CommentingModes } from "app/globals";
import { blacklist, override, saveDefaults, whitelist } from "lib/lemmatizer/lemmatizer";


const ZGetPage = z.object({
  page: z.number().int()
});
export type AGetUnreviewedLemmatizerPropositions = z.infer<typeof ZGetPage>;


async function getUnreviewedLemmatizerPropositions(payload: AGetUnreviewedLemmatizerPropositions) {
  return await query(({ lemmatizer_propositions }, { page }) => {
    return {
      unreviewed: lemmatizer_propositions.filter(p => !p.reviewed).paginate(page, 20).select(),
    }
  }, payload);
}

export type FGetUnreviewedLemmatizerPropositions = typeof getUnreviewedLemmatizerPropositions;
//////////////////////////////////////////////////////////////////////////

const ZResolvePropostion = z.object({
  word: z.string(),
  lemma: z.string(),
  list: z.enum(["white", "black", "override", "decline"]),

  propositionId: z.number().int(),
});
export type AResolvePropostion = z.infer<typeof ZResolvePropostion>;


async function resolveProposition(payload: AResolvePropostion) {
  let { word, lemma, list } = payload;

  if (list == "override") {
    override(word.toLowerCase(), lemma.toLowerCase());
  } else if (list == "black") {
    blacklist(word.toLowerCase());
  } else if (list == "white") {
    whitelist(word.toLowerCase());
  }

  saveDefaults();

  return await query(({ lemmatizer_propositions }, { propositionId }, { $ }) => {
    lemmatizer_propositions.where("id" as any, propositionId).update(r => r.reviewed = true);
  }, payload);
}

export type FResolvePropostion = typeof resolveProposition;
//////////////////////////////////////////////////////////////////////////


const ZEmpty = z.object({
});
export type AEmpty = z.infer<typeof ZEmpty>;


async function unreviewAll(payload: AEmpty) {
  return await query(({ lemmatizer_propositions }) => {
    lemmatizer_propositions.all().update(r => {
      r.reviewed = false;
    });
    return lemmatizer_propositions.all().paginate(1, 20).select();
  }, payload);
}

export type FUnreviewAll = typeof unreviewAll;
//////////////////////////////////////////////////////////////////////////



const ZRemoveTicketImage = z.object({
  id: z.number().int(),
});

export type ARemoveTicketImage = z.infer<typeof ZRemoveTicketImage>;


async function removeTicketImage({ id }: ARemoveTicketImage) {
  return removeExamTicketImage(id);
}

export type FRemoveTicketImage = typeof removeTicketImage;
//////////////////////////////////////////////////////////////////////////



const getFreeDiscussionId = methodFactory(({ comments }) => {
  return ++comments.meta.lastDiscussionId;
});

export type FGetFreeDiscussionId = typeof getFreeDiscussionId;
//////////////////////////////////////////////////////////////////////////

const ZSetCommentingMode = z.object({
  commentingMode: z.enum(CommentingModes),
});

export type ASetCommentingMode = z.infer<typeof ZSetCommentingMode>;

const setCommentingMode = methodFactory(({ comments }, { commentingMode }: ASetCommentingMode) => {
  comments.meta.commentingMode = commentingMode;
  return comments.meta;
});

export type FSetCommentingMode = typeof setCommentingMode;
//////////////////////////////////////////////////////////////////////////


const ZRemoveComment = z.object({
  commentId: z.number().int(),
});

export type ARemoveComment = z.infer<typeof ZRemoveComment>;

const removeComment = methodFactory(({ comments }, { commentId }: ARemoveComment) => {
  comments.where("id", commentId).delete();
});

//////////////////////////////////////////////////////////////////////////

export const customRules = {
  unreviewAll: ZEmpty,
  getUnreviewedLemmatizerPropositions: ZGetPage,
  resolveProposition: ZResolvePropostion,
  removeTicketImage: ZRemoveTicketImage,
  getFreeDiscussionId: ZEmpty,
  setCommentingMode: ZSetCommentingMode,
  removeComment: ZRemoveComment,
};

export const customAPI = {
  unreviewAll,
  getUnreviewedLemmatizerPropositions,
  resolveProposition,
  removeTicketImage,
  getFreeDiscussionId,
  setCommentingMode,
  removeComment,
}