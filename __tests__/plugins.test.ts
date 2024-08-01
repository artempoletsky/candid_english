// import {  } from "@artempoletsky/kurgandb/build/src/db.js";
import { GlobalScope } from "@artempoletsky/kurgandb";
import { Plugins, drill as DrillBluginDef, aes as AESPluginDef, txt as TXTPluginDef } from "kdbUser/plugins";
import zod from "zod";
import lodash from "lodash";

const ScopeMock: GlobalScope = {
  db: {
    getTables() {
      return {
        user_rights: {
          getRecordDraft() { return {} }
        }
      }
    }
  },
  $: {
    require(str: string) {
      return eval(`require(str)`);
    },
  },
  z: zod,
  _: lodash,
} as any;

describe("Interdrill plugin", () => {
  let drill: Plugins["drill"];
  let aes: Plugins["aes"];
  let txt: Plugins["txt"];

  beforeAll(() => {
    drill = DrillBluginDef.install(ScopeMock);

    process.env.AES_KEY = "123456789abcdefg";
    aes = AESPluginDef.install(ScopeMock);
    txt = TXTPluginDef.install(ScopeMock);
  });


  test("encrypt/decrypt id number", () => {
    // process.env.AES_KEY = "123456789abcdefg";
    const { decryptId, encryptId } = aes;

    // console.log(encryptId(1));

    expect(decryptId("asdasdasd")).toBeNaN();
    expect(decryptId(encryptId(1))).toBe(1);
    expect(decryptId(encryptId(2))).toBe(2);
    expect(decryptId(encryptId(3))).toBe(3);
    expect(decryptId(encryptId(10))).toBe(10);
    expect(decryptId(encryptId(123123))).toBe(123123);
  });


  test("prepareComment", () => {
    const prepareComment = txt.prepareComment;

    expect(prepareComment(">>47\n>poop\n>>43\n>poop"))
    .toBe(`<p><span class="post_link" data-post="47">&gt;&gt;47</span></p><p><blockquote>&gt;poop</blockquote></p><p><span class="post_link" data-post="43">&gt;&gt;43</span></p><p><blockquote>&gt;poop</blockquote></p>`);
    expect(prepareComment(" >>123\n>>321 \n asdaskdjh")).toBe(`<p> <span class="post_link" data-post="123">&gt;&gt;123</span></p><p><span class="post_link" data-post="321">&gt;&gt;321</span> </p><p> asdaskdjh</p>`);
    expect(prepareComment(">>123")).toBe(`<p><span class="post_link" data-post="123">&gt;&gt;123</span></p>`);
    expect(prepareComment(">poop")).toBe(`<p><blockquote>&gt;poop</blockquote></p>`);

    



  });


  // test("seedRandom", () => {
  //   let rand = plugin.seedRandom(123);
  //   expect(typeof rand).toBe("number");
  //   expect(Math.asin(rand / 2131829438012893)).toBe(123)
  //   // plugin.seedRandom(123);
  //   let randSet = new Set<number>();
  //   for (let i = 0; i < 100000; i++) {
  //     rand = plugin.seedRandom(i);
  //     if (randSet.has(i)) throw new Error(`double found ${i}`);
  //     randSet.add(rand);
  //   }
  // });
});