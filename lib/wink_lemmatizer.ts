

export type LemmatizeResult = {
  sentence: string,
  lemma: string,
  count: number,
  word: string,
};

import winkNLP from "wink-nlp";
import model from "wink-eng-lite-web-model";


// Instantiate winkNLP.
const nlp = winkNLP(model);
// Obtain "its" helper to extract item properties.
const its = nlp.its;
// Obtain "as" reducer helper to reduce a collection.
const as = nlp.as;


const Overrides: Record<string, string> = require("../data/lemma_overrides.json");
const Irregular: Record<string, string> = require("../data/irregular_verbs.json");


const suffixesToRemove = ["'m", "'ve", "'re", "'d", "n't"];
export default function lemmatize(text: string): { [key: string]: LemmatizeResult } {
  const dict: { [key: string]: LemmatizeResult } = {};
  const doc = nlp.readDoc(text);

  // let pNounHack = false;
  doc.sentences().each(sentence => {
    const tokens = sentence.tokens().filter(t => {
      const word = t.out(its.value);
      if (word.match(/[0-9,.]/)) {
        return false;
      }
      return t.out(its.type) == "word" || t.out(its.pos) != "PNOUN";
    });
    const lemmas: string[] = tokens.out(its.lemma);
    const w: string[] = tokens.out(its.value);
    // console.log(lemmas);

    for (let i = 0; i < lemmas.length; i++) {
      let lemma = lemmas[i]
      if (Overrides[lemma]) {
        lemma = Overrides[lemma];
      } else if (Irregular[lemma]) {
        lemma = Irregular[lemma];
      } else {
        for (const s of suffixesToRemove) {
          if (lemma.endsWith(s)) {
            lemma = lemma.slice(0, -s.length);
            break;
          }
        }
        lemma = lemma.replace(/\W/, '');
        if (lemma.length < 2) {
          continue;
        }
      }
      lemma = lemma.toLowerCase();
      if (dict[lemma]) {
        dict[lemma].count++;
        continue;
      }
      dict[lemma] = {
        lemma,
        word: w[i],
        sentence: sentence.out(its.value),
        count: 1
      };
    }
  });
  return dict;
};