
import type { GlobalScope } from "@artempoletsky/kurgandb";
import zod from "zod";

const pluginDef = {
  npm: [],
  install({ z }: GlobalScope) {
    const levelA0C2 = z.enum(["a0", "a1", "a2", "b1", "b2", "c1", "c2"]);
    const levelA1C1 = z.enum(["a1", "a2", "b1", "b2", "c1"]);
    const levelA1C2 = z.enum(["a1", "a2", "b1", "b2", "c1", "c2"]);
    const levelA0C2X = z.enum(["x", "a0", "a1", "a2", "b1", "b2", "c1", "c2"]);
    const levelA0C2Empty = z.enum(["", "a0", "a1", "a2", "b1", "b2", "c1", "c2"]);
    const username = z.string().min(5, "At least 5 symbols");
    const password = z.string().min(5, "At least 5 symbols");
    const email = z.string().email();
    return {
      levelA0C2,
      levelA1C1,
      levelA1C2,
      levelA0C2X,
      levelA0C2Empty,
      username,
      password,
      email,
    }
  }
};

export const zodGlobals = pluginDef.install({
  z: zod,
} as any);


export default pluginDef;