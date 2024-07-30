
import { queryUniversal as query } from "@artempoletsky/kurgandb";
import fs from "fs";
import type { TableScheme } from "@artempoletsky/kurgandb/globals";
import generateCodeFile from "../generate";
import { generateRecordTypesFromScheme, getTypeNames } from "../../../../app/kurgandb/[tableName]/scheme/generateType";

type AllTableSchemas = Record<string, TableScheme>;


async function getAllTablesSchemas(): Promise<AllTableSchemas> {
  return await query(({ }, { }, { db }) => {
    const res: AllTableSchemas = {};
    const tableNames = Object.keys(db.getTables());
    for (const key of tableNames) {
      res[key] = db.getScheme(key) as any;
    }
    return res;
  }, {});
}


function generateTablesTypeDef(scheme: AllTableSchemas) {

  function printTypes(tableName: string, scheme: TableScheme) {
    const names = getTypeNames(tableName, scheme);
    const types: string[] = [];
    for (const key of ["full", "idT", "meta", "insert", "light", "visible"] satisfies (keyof typeof names)[]) {
      if (names[key]) {
        types.push(`${key == "idT" ? "" : "types."}${names[key]}`);
      }
    }
    return "\r\n    " + types.join(",\r\n    ");
  }
  let result = `export type Tables = {\r\n`;
  for (const tableName in scheme) {


    result += `  ${tableName}: Table<${printTypes(tableName, scheme[tableName])}`
    result += `\r\n  >;\r\n`;
  }

  result += `};`;

  return result;
}

function generateTablesSchemas(scheme: AllTableSchemas) {
  let types = "";


  for (const tableName in scheme) {
    const tScheme = scheme[tableName];

    const names = getTypeNames(tableName, tScheme);

    types += generateRecordTypesFromScheme(tScheme, tableName);

    types += `export type ${names.meta} = {};\r\n\r\n`;

    types += `\r\n\r\n`;

  }
  return types;
}



export default async function generateDB(rewrite: boolean = false): Promise<string> {
  let result = "";
  const scheme: AllTableSchemas = await getAllTablesSchemas();

  const dbOut = process.cwd() + "/db.ts";
  const globalsOut = process.cwd() + "/globals.ts";
  const rpcOut = process.cwd() + "/rpc.ts";
  const sourcePath = `${process.cwd()}/app/kurgandb_admin/codegen/db`;


  if (fs.existsSync(dbOut) && !rewrite) {
    result += "db.ts exists, skipping... ";
  } else {
    generateCodeFile(sourcePath + "/db.ts.txt", dbOut, {
      $$TABLES$$: generateTablesTypeDef(scheme),
    });
    result += "db.ts generated; ";
  }

  if (fs.existsSync(globalsOut) && !rewrite) {
    result += "globals.ts exists, skipping... ";
  } else {
    generateCodeFile(sourcePath + "/globals.ts.txt", globalsOut, {
      $$SCHEMAS$$: generateTablesSchemas(scheme),
    });
    result += "globals.ts generated; ";
  }

  if (fs.existsSync(rpcOut) && !rewrite) {
    result += "rpc.ts exists, skipping... ";
  } else {
    generateCodeFile(sourcePath + "/rpc.ts.txt", rpcOut, {
    });
    result += "rpc.ts generated; ";
  }

  return result;
}