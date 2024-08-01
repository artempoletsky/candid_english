// "use server";

import type { GlobalScope } from "@artempoletsky/kurgandb";
import type Aesjs from "aes-js";

const pluginDef = {
  npm: ["aes-js"],
  install({ $ }: GlobalScope) {
    if (!process.env.AES_KEY) {
      if (process.env.NODE_ENV != "test")
        throw new Error("KurgandbAES plugin: No AES key in env variables");
      // console.warn("KurgandbAES plugin: No AES key in env variables");
      return {} as any;
    }

    const aesjs: typeof Aesjs = $.require("aes-js");
    const key = parseKey(process.env.AES_KEY);


    function numToStr(num: number): string {
      return num.toString().padStart(5, "0");
    }

    function generateKey() {
      const result: number[] = [];
      for (let i = 0; i < 16; i++) {
        result.push(Math.ceil(Math.random() * 16));
      }
      return result;
    }

    function stringifyKey(key: number[]): string {
      let result = "";
      for (const k of key) {
        result += k.toString(36);
      }
      return result;
    }

    function parseKey(key: string): number[] {
      const result: number[] = [];
      for (const c of key) {
        result.push(parseInt(c, 36));
      }
      return result;
    }

    return {
      parseKey,
      stringifyKey,
      generateKey,
      encryptId(id: number): string {
        const str = numToStr(id);
        const textBytes = aesjs.utils.utf8.toBytes(str);
        const aesCtr = new aesjs.ModeOfOperation.ctr(key);
        const encryptedBytes = aesCtr.encrypt(textBytes);
        return aesjs.utils.hex.fromBytes(encryptedBytes);
      },
      decryptId(encrypted: string): number {
        try {
          const encryptedBytes = aesjs.utils.hex.toBytes(encrypted);

          const aesCtr = new aesjs.ModeOfOperation.ctr(key);
          const decryptedBytes = aesCtr.decrypt(encryptedBytes);

          const decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
          return (decryptedText as any) * 1;
        } catch (error) {
          return NaN;
        }
      },
    }
  }
};

const plugin = pluginDef.install({
  $: {
    require(str: string) {
      return eval(`require(str)`);
    },
  }
} as any);

export const encryptId = plugin.encryptId;
export const decryptId = plugin.decryptId;

export default pluginDef;