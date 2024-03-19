import { FieldType, PlainObject } from "@artempoletsky/kurgandb/globals";
import fs from "fs";
import generateDB from "./codegen/db/generate_db";
import generateCodeFile from "./codegen/generate";
import { queryUniversal } from "@artempoletsky/kurgandb";



export const codeGeneration = {
  async generateGlobalsAndDB_Files() {
    return await generateDB();
  },
}

export async function exampleScript(argument1: string, argument2: string) {
  // You can add a descrition with the comment

  return `Hello world! ${argument1} ${argument2} `;
}


export const NextRoutes = {
  async createNewPage(path: string, mainComponentName: string) {
    if (!path) {
      return "Specify a path for the Next router!"
    }
    if (!mainComponentName) {
      mainComponentName = "UnnamedPage";
    }

    const dirPath = process.cwd() + "/app/" + path;
    if (fs.existsSync(dirPath)) return "Already exists!";


    fs.mkdirSync(dirPath, { recursive: true });
    const variables = {
      $$PATH$$: path,
      $$COMP$$: mainComponentName,
    }

    const sourcePath = `${process.cwd()}/app/kurgandb_admin`;
    generateCodeFile(sourcePath + "/codegen/newpage/page.tsx.txt", dirPath + "/page.tsx", variables);
    generateCodeFile(sourcePath + "/codegen/newpage/UnnamedPage.tsx.txt", dirPath + `/${mainComponentName}.tsx`, variables);

    this.createNewAPI(path + "/api");
  },

  async createNewAPI(path: string) {
    const dirPath = process.cwd() + "/app/" + path;
    if (fs.existsSync(dirPath)) return "Already exists!";

    fs.mkdirSync(dirPath, { recursive: true });

    const sourcePath = `${process.cwd()}/app/kurgandb_admin`;

    generateCodeFile(sourcePath + "/codegen/newpage/api/route.ts.txt", dirPath + "/route.ts", {});
    generateCodeFile(sourcePath + "/codegen/newpage/api/schemas.ts.txt", dirPath + "/schemas.ts", {});

    return "Success!";
  },
}


export async function ThrowError(message: string) {
  try {
    await queryUniversal(({ }, { message }, { ResponseError }) => {
      throw new Error(message);
    }, {
      message
    });
  } catch (err: any) {
    return err.message;
  }
}

