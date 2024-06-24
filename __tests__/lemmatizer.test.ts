
import { describe, expect, test, beforeAll } from "@jest/globals";

// import lemmatize from "../lib/wink_lemmatizer";
import lemmatize, { LemmatizerOptions, LemmatizerOptionsInner, cutPrefix, cutSuffix, lemmatizeWord } from "../lib/lemmatizer";
import simplify from "../lib/simplify_words";

const xdescribe = (...args: any) => { };
const xtest = (...args: any) => { };

describe("Simplify", () => {
  let allWordsDict: Set<string>;

  beforeAll(() => {
    allWordsDict = simplify();
  });

  test("dictionary check", () => {
    // expect(allWordsDict["odd"]).toBeDefined();
    // expect(allWordsDict["odd"]).toBeDefined();
    // expect(allWordsDict["grim"]).toBeDefined();
    // expect(allWordsDict["second"]).toBeDefined();
    // expect(allWordsDict["spoiler"]).toBeDefined();
    // expect(allWordsDict["bush"]).toBeDefined();
    // expect(allWordsDict["drape"]).toBeDefined();
    // expect(allWordsDict["go"]).toBeDefined();
    // expect(allWordsDict["five"]).toBeDefined();
    // expect(allWordsDict["enforcer"]).toBeDefined();
    // expect(allWordsDict["jinx"]).toBeDefined();
    // expect(allWordsDict["toss"]).toBeDefined();
    // expect(allWordsDict["brave"]).toBeDefined();
    // expect(allWordsDict["answer"]).toBeDefined();
    // expect(allWordsDict["cancel"]).toBeDefined();
    // expect(allWordsDict["undead"]).toBeDefined();


    expect(allWordsDict.has("bodie")).toBe(false);
    // expect(allWordsDict["pens"]).toBeUndefined();
    expect(allWordsDict.has("seconde")).toBe(false);
    // expect(allWordsDict["spoilers"]).toBeUndefined();
    // expect(allWordsDict["bushes"]).toBeUndefined();
    expect(allWordsDict.has("goe")).toBe(false);
    // expect(allWordsDict["fifth"]).toBeUndefined();
    expect(allWordsDict.has("wo")).toBe(false);
    // expect(allWordsDict["enforcers"]).toBeUndefined();
    // expect(allWordsDict["jinxes"]).toBeUndefined();
    // expect(allWordsDict["tosses"]).toBeUndefined();
    // expect(allWordsDict["bravely"]).toBeUndefined();
    // expect(allWordsDict["answers"]).toBeUndefined();
    // expect(allWordsDict["cancelling"]).toBeUndefined();
    // expect(allWordsDict["reused"]).toBeUndefined();
    // expect(allWordsDict["reuse"]).toBeUndefined();
  });

  test("brothers", () => {
    let lemmas = lemmatize("brothers");
    expect(lemmas["brother"]).toBeDefined();
  });
});


describe("functions", () => {
  const dict = new Set([
    "gain",
    "gained",
    "regain",
    "regained",
    "relish",
    "brother",
    "bidding",
    "bid",
    "driver",
    "drivers",
    "drive",
    "need",
    "nee",
    "needed",
  ]);
  const options: LemmatizerOptionsInner = {
    cutPrefixes: {
      re: true,
      un: true,
    }
  }
  test("cutPrefix", () => {
    expect(cutPrefix("gain", dict, options)).toBe("gain");
    expect(cutPrefix("regain", dict, options)).toBe("gain");
    expect(cutPrefix("regained", dict, options)).toBe("gained");
    expect(cutPrefix("gained", dict, options)).toBe("gained");
    expect(cutPrefix("relish", dict, options)).toBe("relish");
    expect(cutPrefix("renown", dict, options)).toBe("renown");
  });

  test("cutSuffix", () => {
    expect(cutSuffix("gain", dict, options)).toBe("gain");
    expect(cutSuffix("regain", dict, options)).toBe("regain");
    expect(cutSuffix("regained", dict, options)).toBe("regain");
    expect(cutSuffix("gained", dict, options)).toBe("gain");
    expect(cutSuffix("relish", dict, options)).toBe("relish");
    expect(cutSuffix("renown", dict, options)).toBe("renown");
    expect(cutSuffix("brothers", dict, options)).toBe("brother");
    expect(cutSuffix("biddings", dict, options)).toBe("bidding");
    expect(cutSuffix("bidding", dict, options)).toBe("bid");
    expect(cutSuffix("drivers", dict, options)).toBe("driver");
    expect(cutSuffix("driver", dict, options)).toBe("drive");
    expect(cutSuffix("needed", dict, options)).toBe("need");
  });

  test("lemmatizeWord", () => {
    expect(lemmatizeWord("gain", dict, options)).toBe("gain");
    expect(lemmatizeWord("regain", dict, options)).toBe("regain");
    expect(lemmatizeWord("regained", dict, options)).toBe("gain");
    expect(lemmatizeWord("gained", dict, options)).toBe("gain");
    expect(lemmatizeWord("relish", dict, options)).toBe("relish");
    expect(lemmatizeWord("renown", dict, options)).toBe("renown");
  });
});

describe("Lemmatizer", () => {

  test("counts lemmas in text", () => {
    let lemmas = lemmatize("No. Standard black.");
    expect(Object.keys(lemmas).length).toBe(3);

    const no = lemmas["no"];
    expect(no.lemma).toEqual("no");
    expect(no.count).toEqual(1);
  });

  test("supports lemma overrides", () => {
    let lemmas = lemmatize("an");

    expect(lemmas["a"]).toBeDefined();
    expect(lemmas["a"].word).toEqual("an");
  });

  test("guys bug", () => {
    lemmatize("Foo bar");
    let lemmas = lemmatize("Guys?");

    expect(lemmas["guys"]).toBeUndefined();
    expect(lemmas["guy"]).toBeDefined();
  });

  test("removes unneeded contractions", () => {
    let lemmas = lemmatize("I'm having contractions.");

    expect(Object.keys(lemmas).length).toBe(3);

    expect(lemmas["i"].word).toEqual("I'm")
    expect(lemmas["have"].word).toEqual("having");
    expect(lemmas["contraction"].word).toEqual("contractions");
  });

  test("supports irregular verbs", () => {
    let lemmas = lemmatize("got");

    expect(lemmas["get"]).toBeDefined();
  });

  test("splits words correctly", () => {
    let lemmas = lemmatize("Yeah, well, you need to seriously think about giving that license back.");

    expect(lemmas["well,"]).toBeUndefined();
  });

  test("need", () => {
    let lemmas = lemmatize("I need you to get this woman away from these fumes.");
    expect(lemmas["need"]).toBeDefined();
  });

  test("hop hope", () => {
    let lemmas = lemmatize("hopping hoping");

    expect(lemmas["hope"].word).toEqual("hoping");
    expect(lemmas["hop"].word).toEqual("hopping");
  });

  test("minute", () => {
    let lemmas = lemmatize("minutes");

    expect(lemmas["minute"].word).toEqual("minutes");
  });

  test("bodies", () => {
    let lemmas = lemmatize("bodies");
    expect(lemmas["body"].word).toEqual("bodies");
  });

  test("odd", () => {
    let lemmas = lemmatize("odd");
    expect(lemmas["odd"].word).toEqual("odd");
  });

  test("pen", () => {
    let lemmas = lemmatize("pens pen");
    expect(lemmas["pen"].count).toEqual(2);
  });

  test("grim", () => {
    let lemmas = lemmatize("grim");
    expect(lemmas["grim"].count).toEqual(1);
  });

  test("they'll", () => {
    let lemmas = lemmatize("they'll");
    expect(lemmas["they"].count).toEqual(1);
  });

  test(" warning:", () => {
    let lemmas = lemmatize(" warning:");
    expect(lemmas["warn"].count).toEqual(1);
  });

  test(" don't", () => {
    let lemmas = lemmatize("	I don't know. I think it just happened.");
    expect(lemmas["don"]).toBeUndefined();
    expect(lemmas["do"].count).toEqual(1);
  });

  test("bushes brushes", () => {
    let lemmas = lemmatize("bushes brushes she");
    expect(lemmas["bush"].count).toEqual(1);
    expect(lemmas["brush"].count).toEqual(1);
    expect(lemmas["she"].count).toEqual(1);
  });

  test("drapes", () => {
    let lemmas = lemmatize("drapes");
    expect(lemmas["drape"].count).toEqual(1);
  });

  test("goes", () => {
    let lemmas = lemmatize("goes");
    expect(lemmas["go"].count).toEqual(1);
  });

  test("girls' ", () => {
    let lemmas = lemmatize("  girls'");
    expect(lemmas["girl"].count).toEqual(1);
  });

  test("twelfth fifth", () => {
    let lemmas = lemmatize("twelfth fifth");

    expect(lemmas["twelve"]).toBeDefined();
    expect(lemmas["five"]).toBeDefined();
  });

  test("never", () => {
    let lemmas = lemmatize("never");
    expect(lemmas["never"]).toBeDefined();
  });

  test("died ", () => {
    let lemmas = lemmatize("died");
    expect(lemmas["die"]).toBeDefined();
  });

  test("smaller", () => {
    let lemmas = lemmatize("smaller smallest");
    expect(lemmas["small"].count).toEqual(2);
  });

  test("crossing", () => {
    let lemmas = lemmatize("crossing");
    expect(lemmas["cross"].count).toEqual(1);
  });

  test("won't", () => {
    let lemmas = lemmatize("won't");
    expect(lemmas["will"].count).toEqual(1);
  });

  test("touches", () => {
    let lemmas = lemmatize("touches");
    expect(lemmas["touch"].count).toEqual(1);
  });

  test("serves to wolves", () => {
    let lemmas = lemmatize("serves to wolves");

    expect(lemmas["serve"]).toBeDefined();
    expect(lemmas["wolf"]).toBeDefined();
  });

  test("runnin'	", () => {
    let lemmas = lemmatize("runnin' ");

    expect(lemmas["run"]).toBeDefined();
  });

  test("enforcers'	", () => {
    expect(lemmatizeWord("enforcers")).toBe("enforce")
  });

  test("jinxes boxes", () => {
    let lemmas = lemmatize("jinxes boxes");

    expect(lemmas["jinx"]).toBeDefined();
    expect(lemmas["box"]).toBeDefined();
  });

  test("missing promises", () => {
    expect(lemmatizeWord("missing")).toBe("miss");
    expect(lemmatizeWord("promises")).toBe("promise");
    let lemmas = lemmatize("missing promises");

    expect(lemmas["miss"]).toBeDefined();
    expect(lemmas["promise"]).toBeDefined();
  });

  test("Nobody tosses a Dwarf.", () => {
    expect(lemmatizeWord("tosses")).toBe("toss");
    let lemmas = lemmatize("Nobody tosses a Dwarf.");
    expect(lemmas["toss"]).toBeDefined();
  });

  test("biases", () => {
    let lemmas = lemmatize("biases");
    expect(lemmas["bias"]).toBeDefined();
  });

  test("buyers", () => {
    let lemmas = lemmatize("buyers");
    expect(lemmas["buy"]).toBeDefined();
  });

  test("answers", () => {
    let lemmas = lemmatize("answer");
    expect(lemmas["answer"]).toBeDefined();
  });

  test("woes", () => {
    let lemmas = lemmatize("woes");
    expect(lemmas["woe"]).toBeDefined();
  });

  test("dying dyeing", () => {
    let lemmas = lemmatize("dying dyeing lying");
    expect(lemmas["dye"]).toBeDefined();
    expect(lemmas["die"]).toBeDefined();
    expect(lemmas["lie"]).toBeDefined();
  });

  test("(sniffs)", () => {
    let lemmas = lemmatize("(sniffs)");
    expect(lemmas["sniff"]).toBeDefined();
  });


  test("untrue", () => {
    let lemmas = lemmatize("untrue");
    expect(lemmas["true"]).toBeDefined();
  });

  test("reclaimed", () => {
    let lemmas = lemmatize("reclaimed");
    expect(lemmas["claim"]).toBeDefined();
  });

  test("regained", () => {
    let lemmas = lemmatize("regained");
    expect(lemmas["gain"]).toBeDefined();
  });

  test("unneeded", () => {
    expect(lemmatizeWord("unneeded")).toBe("need");
  });
});