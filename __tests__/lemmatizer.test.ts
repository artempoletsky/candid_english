
import { describe, expect, test, beforeAll } from "@jest/globals";

// import lemmatize from "../lib/wink_lemmatizer";
import lemmatize from "../lib/lemmatizer";
import simplify from "../lib/simplify_words";

const xdescribe = (...args: any) => { };
const xtest = (...args: any) => { };

describe("Simplify", () => {
  let allWordsDict: Record<string, number>;

  beforeAll(() => {
    allWordsDict = simplify();
  });

  test("dictionary check", () => {
    expect(allWordsDict["odd"]).toBeDefined();
    expect(allWordsDict["odd"]).toBeDefined();
    expect(allWordsDict["grim"]).toBeDefined();
    expect(allWordsDict["second"]).toBeDefined();
    expect(allWordsDict["spoiler"]).toBeDefined();
    expect(allWordsDict["bush"]).toBeDefined();
    expect(allWordsDict["drape"]).toBeDefined();
    expect(allWordsDict["go"]).toBeDefined();
    expect(allWordsDict["five"]).toBeDefined();
    expect(allWordsDict["enforcer"]).toBeDefined();
    expect(allWordsDict["jinx"]).toBeDefined();
    expect(allWordsDict["toss"]).toBeDefined();
    expect(allWordsDict["brave"]).toBeDefined();
    expect(allWordsDict["answer"]).toBeDefined();


    expect(allWordsDict["bodies"]).toBeUndefined();
    expect(allWordsDict["pens"]).toBeUndefined();
    expect(allWordsDict["seconde"]).toBeUndefined();
    expect(allWordsDict["spoilers"]).toBeUndefined();
    expect(allWordsDict["bushes"]).toBeUndefined();
    expect(allWordsDict["goes"]).toBeUndefined();
    expect(allWordsDict["fifth"]).toBeUndefined();
    expect(allWordsDict["wo"]).toBeUndefined();
    expect(allWordsDict["enforcers"]).toBeUndefined();
    expect(allWordsDict["jinxes"]).toBeUndefined();
    expect(allWordsDict["tosses"]).toBeUndefined();
    expect(allWordsDict["bravely"]).toBeUndefined();
    expect(allWordsDict["answers"]).toBeUndefined();
  });

  xtest("(sniffs)", () => {
    let lemmas = lemmatize("(sniffs)");
    // console.log(lemmas);

    expect(lemmas["sniff"]).toBeDefined();
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
    expect(lemmas["warning"].count).toEqual(1);
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
    let lemmas = lemmatize("enforcers'	");

    expect(lemmas["enforcer"]).toBeDefined();
  });

  test("jinxes boxes", () => {
    let lemmas = lemmatize("jinxes boxes");

    expect(lemmas["jinx"]).toBeDefined();
    expect(lemmas["box"]).toBeDefined();
  });

  test("missing promises", () => {
    let lemmas = lemmatize("missing promises");

    expect(lemmas["miss"]).toBeDefined();
    expect(lemmas["promise"]).toBeDefined();
  });

  test("Nobody tosses a Dwarf.", () => {
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
});