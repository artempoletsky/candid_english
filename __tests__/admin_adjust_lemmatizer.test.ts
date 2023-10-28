import { describe, test, expect } from "@jest/globals"
import { LemmatizerOverrides, LemmatizerBlacklist, LemmatizerWhitelist, LemmatizerWordlist } from '~/lib/paths'
import { addToList, POST } from "~/app/admin/adjust_lemmatizer/route";
import { NextRequest } from "next/server"
// import fs from "fs"
import { wfs, rfs } from "~/lib/util";
import lemmatize from "~/lib/lemmatizer";
import simplify from "~/lib/simplify_words";

const xdescribe = (...args: any) => { };
const xtest = (...args: any) => { };

describe('/admin/adjust_lemmatizer', () => {
  function mockReq(object: any): NextRequest {
    return {
      json: jest.fn().mockResolvedValue(object)
    } as unknown as NextRequest
  }

  function getOverrides(): Record<string, string> {
    return rfs(LemmatizerOverrides);
  }

  function getList(listType: "black" | "white"): string[] {
    let filename = listType == "black" ? LemmatizerBlacklist : LemmatizerWhitelist;
    return rfs(filename);
  }

  function removeOverride(key: string) {
    let overrides = getOverrides();
    delete overrides[key];
    return wfs(LemmatizerOverrides, overrides, {
      pretty: true
    });
  }

  function removeFromList(key: string, listType: "black" | "white") {
    let filename = listType == "black" ? LemmatizerBlacklist : LemmatizerWhitelist;
    let list = getList(listType);
    list = list.filter(w => w != key);
    return wfs(filename, list, {
      pretty: true
    });
  }

  test("doesn't exist error", async () => {
    const response = await POST(mockReq({
      method: "doesn't exist"
    }));

    expect(response.status).toBe(403);

    expect(await response.json()).toEqual({
      message: `Method "doesn't exist" doesn't exist`
    });
  });

  describe("after this", () => {
    test("adds override", async () => {
      // removeOverride("won't");
      // expect(lemmatize("won't")["will"]).toBeUndefined();
      expect(lemmatize("foobar")["foo"]).toBeUndefined();

      let o = getOverrides();
      expect(o["foobar"]).toBeUndefined();

      const response = await POST(mockReq({
        method: "addOverride",
        word: "foobar",
        lemma: "foo",
      }));

      o = getOverrides();
      expect(o["foobar"]).toEqual("foo");

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        message: `OK`
      });
      let lemma = lemmatize("foobar");
      expect(lemma["foo"]).toBeDefined();
    });

    afterAll(() => {
      removeOverride("foobar");
    });
  });


  test("adds to list", async () => {
    let white = getList('white');
    expect(white.includes("foobar")).toBe(false);

    let response = await POST(mockReq({
      method: "addToList",
      word: "foobar",
      listType: "white",
    }));
    expect(response.status).toBe(200);

    white = getList('white');
    expect(white.includes("foobar")).toBe(true);

    removeFromList("foobar", "white");

    let black = getList('black');
    expect(black.includes("foobar")).toBe(false);

    response = await POST(mockReq({
      method: "addToList",
      word: "foobar",
      listType: "black",
    }));
    expect(response.status).toBe(200);

    black = getList('black');
    expect(black.includes("foobar")).toBe(true);

    removeFromList("foobar", "black");

    response = await POST(mockReq({
      method: "addToList",
      word: "foobar",
      listType: "blakc",
    }));

    expect(response.status).toBe(403);

    expect(await response.json()).toEqual({
      message: `Error: 'listType' can be only "black" or "white"`
    });
  });

  describe("after this", () => {
    test("blacklist in action", async () => {
      removeFromList("wolve", "black");
      simplify();

      let black = getList("black");
      expect(black.includes("wolve")).toBe(false);

      let dict = rfs(LemmatizerWordlist);
      expect(dict.wolve).toBeTruthy();

      let lemma = lemmatize("wolves");

      expect(lemma["wolve"]).toBeDefined();

      let response = await POST(mockReq({
        method: "addToList",
        word: "wolve",
        listType: "black",
      }));
      expect(response.status).toBe(200);

      black = getList("black");
      expect(black.includes("wolve")).toBe(true);
      expect(lemmatize("wolves")["wolf"]).toBeDefined();
    });

    afterAll(() => {
      addToList({
        word: "wolve",
        listType: "black"
      });
    });
  });
})