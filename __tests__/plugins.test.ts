// import {  } from "@artempoletsky/kurgandb/build/src/db.js";
import { drill, Plugins } from "~/app/kurgandb_admin/plugins";
import zod from "zod";

const dbMock = {
  getTables() {
    return {
      user_rights: {
        getRecordDraft() { return {} }
      }
    }
  }
} as any;
describe("Interdrill plugin", () => {
  let plugin: Plugins["drill"];
  beforeAll(() => {
    plugin = drill({
      db: dbMock,
      $: dbMock,
      _: dbMock,
      z: zod,
    });
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