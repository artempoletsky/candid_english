import { DictRange, asDict } from "./language_levels";

export const LevelOptions = asDict(DictRange);

export const LevelOptionsAny: Record<string, string> = Object.assign({
  any: "Any",
}, LevelOptions);

export const PartOptions: Record<string, string> = {
  noun: "Noun",
  verb: "Verb",
  adjective: "Adjective",
  adverb: "Adverb",
  preposition: "Preposition",
  conjunction: "Conjunction",
  determiner: "Determiner",
  pronoun: "Pronoun",
  number: "Number",
  "modal verb": "Modal verb",
  other: "Other"
};

export const PartOptionsAny: Record<string, string> = Object.assign({
  any: "Any",
}, PartOptions);