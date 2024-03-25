import { FieldType, PlainObject } from "@artempoletsky/kurgandb/globals";
import fs from "fs";
import generateDB from "./codegen/db/generate_db";
import generateCodeFile from "./codegen/generate";
import { query } from "~/db";




export const Next_routes = {
  async Create_new_page(Path: string, Main_component_name: string) {
    if (!Path) {
      return "Specify a path for the Next router!"
    }
    if (!Main_component_name) {
      Main_component_name = "UnnamedPage";
    }

    const dirPath = process.cwd() + "/app/" + Path;
    if (fs.existsSync(dirPath)) return "Already exists!";


    fs.mkdirSync(dirPath, { recursive: true });
    const variables = {
      $$PATH$$: Path,
      $$COMP$$: Main_component_name,
    }

    const sourcePath = `${process.cwd()}/app/kurgandb_admin`;
    generateCodeFile(sourcePath + "/codegen/newpage/page.tsx.txt", dirPath + "/page.tsx", variables);
    generateCodeFile(sourcePath + "/codegen/newpage/UnnamedPage.tsx.txt", dirPath + `/${Main_component_name}.tsx`, variables);

    this.Create_new_API(Path + "/api");
  },

  async Create_new_API(Path: string) {
    const dirPath = process.cwd() + "/app/" + Path;
    if (fs.existsSync(dirPath)) return "Already exists!";

    fs.mkdirSync(dirPath, { recursive: true });

    const sourcePath = `${process.cwd()}/app/kurgandb_admin`;

    generateCodeFile(sourcePath + "/codegen/newpage/api/route.ts.txt", dirPath + "/route.ts", {});
    generateCodeFile(sourcePath + "/codegen/newpage/api/schemas.ts.txt", dirPath + "/schemas.ts", {});
    generateCodeFile(sourcePath + "/codegen/newpage/api/methods.ts.txt", dirPath + "/methods.ts", {});

    return "Success!";
  },
}

export async function Do_nothing() {
  return await query(({ test_questions, comments }, { }, { }) => {

  });
}