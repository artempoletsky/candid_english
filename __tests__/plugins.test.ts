// import {  } from "@artempoletsky/kurgandb/build/src/db.js";
import { GlobalScope } from "@artempoletsky/kurgandb";
import { Plugins, drill as DrillBluginDef, aes as AESPluginDef } from "kdbUser/plugins";
import zod from "zod";

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
  _: {},
} as any;

describe("Interdrill plugin", () => {
  let drill: Plugins["drill"];
  let aes: Plugins["aes"];

  beforeAll(() => {
    drill = DrillBluginDef.install(ScopeMock);

    process.env.AES_KEY = "123456789abcdefg";
    aes = AESPluginDef.install(ScopeMock)
  });


  test("encrypt/decrypt id number", async () => {
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