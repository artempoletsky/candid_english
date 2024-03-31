import { ResponseError } from "@artempoletsky/easyrpc";
import z from "zod";
import { query, methodFactory } from "app/db";
import { LEMMATIZER_BLACKLIST, LEMMATIZER_OVERRIDES, LEMMATIZER_WHITELIST } from "lib/paths";
import simplify from "lib/simplify_words";
import { rfs, wfs } from "lib/util";
import { removeExamTicketImage } from "app/api/image/methods_image";


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
    const overrides: Record<string, string> = rfs(LEMMATIZER_OVERRIDES);
    overrides[word.toLowerCase()] = lemma.toLowerCase();
    wfs(LEMMATIZER_OVERRIDES, overrides, {
      pretty: true
    });
    simplify();

  } else if (list == "black" || list == "white") {
    const filename = list == "white" ? LEMMATIZER_WHITELIST : LEMMATIZER_BLACKLIST;
    console.log(filename);

    const listData: string[] = rfs(filename);
    word = word.toLowerCase();

    if (list.includes(word)) return;
    listData.push(word);
    wfs(filename, listData, {
      pretty: true
    });
    simplify();
  }



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



const getFreeDiscussionId = methodFactory(({ test_questions, posts }) => {
  // console.log();
  
  const last1:number = test_questions.indexKeys("discussionId").at(-1) as any || 0;
  const last2:number = posts.indexKeys("discussionId").at(-1) as any || 0;
  return Math.max(last1, last2) + 1;
});

export type FGetFreeDiscussionId = typeof getFreeDiscussionId;
//////////////////////////////////////////////////////////////////////////

export const customRules = {
  unreviewAll: ZEmpty,
  getUnreviewedLemmatizerPropositions: ZGetPage,
  resolveProposition: ZResolvePropostion,
  removeTicketImage: ZRemoveTicketImage,
  getFreeDiscussionId: ZEmpty,
};

export const customAPI = {
  unreviewAll,
  getUnreviewedLemmatizerPropositions,
  resolveProposition,
  removeTicketImage,
  getFreeDiscussionId,
}