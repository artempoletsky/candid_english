import { rfs } from "lib/util";
import { AModifyUserWords, AWordlists, AWords, WordlistsLevel } from "./schemas_words";
import { OXFORD_BY_LEVEL } from "lib/paths";
import { LanguageLevel } from "lib/language_levels";
import { query } from "app/db";
import { getSession } from "app/session/session";




let wordlists: Record<string, string[]> = {};

function getWordlist(wordlistName: WordlistsLevel): string[] {
  if (wordlists[wordlistName]) {
    return wordlists[wordlistName];
  }

  wordlists = rfs(OXFORD_BY_LEVEL);

  return wordlists[wordlistName] || [];
}

function wordlistsWords(wordlists: WordlistsLevel[]): string[] {
  const result: string[] = [];
  for (const key of wordlists) {
    result.push(...getWordlist(key));
  }
  return result;
}

export async function modifyUserWords(payload: AModifyUserWords) {
  const session = await getSession();

  const result = await query(({ users, test_words }, { userId, added, removed, addedWordlists, removedWordlists }, { _, $ }) => {
    added = added.slice(0);
    removed = removed.slice(0);
    if (addedWordlists.length) {
      added.push(...test_words.where("level", ...addedWordlists).limit(0).select($.primary))
    }
    if (removedWordlists.length) {
      removed.push(...test_words.where("level", ...removedWordlists).limit(0).select($.primary))
    }

    added = _.uniq(added);
    removed = _.uniq(removed);
    // console.log(removed);
    // console.log(test_words.where("level", ...removedWordlists).select($.primary));
    
    const now = Date.now();
    if (userId !== undefined) {
      users.where("id", userId).update(user => {
        user.knownWords = _.uniq(_.concat(_.difference(user.knownWords, removed), added));
        user.knownWordsVersion = new Date();
      });
    }
    return {
      added,
      removed,
      updateTimestamp: now,
    };
  }, {
    ...payload,
    userId: session.user?.id,
  });
  return result;
}

export type FModifyUserWords = typeof modifyUserWords;
export type RModifyUserWords = Awaited<ReturnType<FModifyUserWords>>;

const ModifyDefault: AModifyUserWords = {
  added: [],
  removed: [],
  addedWordlists: [],
  removedWordlists: [],
}

export async function addWords({ words }: AWords) {
  return await modifyUserWords({ ...ModifyDefault, added: words });
}

export async function removeWords({ words }: AWords) {
  return await modifyUserWords({ ...ModifyDefault, removed: words });
}


export async function addWordlists({ wordlists }: AWordlists) {
  return await modifyUserWords({ ...ModifyDefault, addedWordlists: wordlists });
}

export async function removeWordlists({ wordlists }: AWordlists) {
  return await modifyUserWords({ ...ModifyDefault, removedWordlists: wordlists });
}