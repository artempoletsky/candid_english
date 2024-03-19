
import { queryUniversal as query } from "@artempoletsky/kurgandb";
import fs from "fs";
import type { FieldTag, FieldType, TableScheme } from "@artempoletsky/kurgandb/globals";
import generateCodeFile from "../generate";

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

function tableNameToTypeName(tableName: string): string {
  if (tableName.endsWith("s")) {
    tableName = tableName.slice(0, tableName.length - 1);
  }
  const words = tableName.split("_").map(w => {
    if (!w) return "";
    const first = w[0].toUpperCase();
    return first + w.substring(1);
  });
  return words.join("");
}


function getTablePrimaryKey(scheme: TableScheme): string {
  const p = getFieldsWithTag(scheme, "primary");
  if (p.length != 1) throw new Error("Invalid primary keys count");
  return p[0];
}


function getTableKeyType(scheme: TableScheme): string {
  return scheme.fields[getTablePrimaryKey(scheme)];
}



function typeToTsType(type: FieldType): string {
  switch (type) {
    case "date": return "Date";
    case "json": return "any";
    default: return type;
  }
}

function typeToZod(type: FieldType): string {
  switch (type) {
    case "date": return "z.date()";
    case "json": return "z.any()";
    default: return `z.${type}()`;
  }
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

function getTableTags(scheme: TableScheme): Set<FieldTag> {
  const result = new Set<FieldTag>();
  for (const key in scheme.tags) {
    for (const tag of scheme.tags[key]) {
      result.add(tag);
    }
  }
  return result;
}



function getTypeNames(tableName: string, scheme: TableScheme) {
  const tags = getTableTags(scheme);
  const basic = tableNameToTypeName(tableName);
  const visible = tags.has("hidden") ? basic : "";
  const full = visible ? `${basic}Full` : basic;
  const light = tags.has("heavy") ? `${basic}Light` : (visible ? basic : "");
  const insert = tags.has("autoinc") ? `${basic}Insert` : (light ? full : "");
  const meta = `${basic}sMeta`;

  return {
    primary: getTablePrimaryKey(scheme),
    basic,
    full,
    idT: getTableKeyType(scheme),
    meta,
    insert,
    light,
    visible,
  };
}

function getFieldsWithTag(scheme: TableScheme, tag: FieldTag): string[] {
  const result: string[] = [];
  for (const fieldName in scheme.tags) {
    if (scheme.tags[fieldName].includes(tag)) {
      result.push(fieldName);
    }
  }
  return result;
}

function generateTablesSchemas(scheme: AllTableSchemas) {
  let types = "";

  function printFieldsWithTag(tScheme: TableScheme, tag: FieldTag) {
    return getFieldsWithTag(tScheme, tag).map(t => `"${t}"`).join(" | ");
  }

  for (const tableName in scheme) {
    const tScheme = scheme[tableName];

    const names = getTypeNames(tableName, tScheme);
    const tags = getTableTags(tScheme);
    types += `export const Z${names.basic} = z.object({\r\n`;
    for (const fieldName in tScheme.fields) {
      const type = tScheme.fields[fieldName];
      const zodType = typeToZod(type);
      types += `  ${fieldName}: ${zodType},\r\n`;
    }
    types += `});\r\n\r\n`;

    types += `export type ${names.full} = z.infer<typeof Z${names.basic}>;\r\n\r\n`;
    types += `export type ${names.meta} = {};\r\n\r\n`;


    if (tags.has("autoinc"))
      types += `export type ${names.insert} = Omit<${names.full}, "${names.primary}">;\r\n\r\n`;

    if (tags.has("heavy"))
      types += `export type ${names.light} = Omit<${names.full}, ${printFieldsWithTag(tScheme, "heavy")}>;\r\n\r\n`;

    if (tags.has("hidden")) {
      console.log(tScheme);
      
      types += `export type ${names.visible} = Omit<${names.full}, ${printFieldsWithTag(tScheme, "hidden")}>;\r\n\r\n`;
    }


    types += `\r\n\r\n`;

  }
  return types;
}



export default async function generateDB(rewrite: boolean = false): Promise<string> {
  let result = "";
  const scheme: AllTableSchemas = await getAllTablesSchemas();

  const dbOut = process.cwd() + "/db.ts";
  const globalsOut = process.cwd() + "/globals.ts";
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

  return result;
}