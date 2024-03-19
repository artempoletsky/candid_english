import { PlainObject } from "@artempoletsky/kurgandb/globals";
import fs from "fs";

export default function generateCodeFile(source: string, target: string, variables: PlainObject) {
  if (!fs.existsSync(source)) throw new Error(`Source file '${source}' not found!`);

  let fileContents = fs.readFileSync(source, { encoding: "utf8" });
  for (const key in variables) {
    fileContents = fileContents.replaceAll(key, variables[key]);
  }

  fs.writeFileSync(target, fileContents);
}