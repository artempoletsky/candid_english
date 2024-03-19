import { FieldType, PlainObject } from "@artempoletsky/kurgandb/globals";
import fs from "fs";
import generateDB from "./codegen/db/generate_db";
import generateCodeFile from "./codegen/generate";
// import { query } from "@/db";
import { queryUniversal as query } from "@artempoletsky/kurgandb";



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

export const Project_setup = {
  async Generate_globals_and_db_files() {
    // Generate globals.ts and db.ts according to your database structure

    return await generateDB(true);
  },
  async Create_users_table() {
    // Create an example table named `users` with predefined fields

    const tableName = "users";

    const result = await query(({ }, { tableName }, { db }) => {
      if (db.doesTableExist(tableName)) {
        return "Table already exists";
      }
      db.createTable({
        name: tableName,
        fields: {
          username: "string",
          password: "string",
          isAdmin: "boolean",
          about: "string",
          birthDate: "date",
        },
        tags: {
          username: ["primary"],
          password: ["hidden"],
          birthDate: ["hidden"],
          about: ["hidden", "heavy", "textarea"],
        }
      });
      return "created";
    }, { tableName });
    return result;
  },

  async Pollute_users_metadata() {
    // Store example metadata in the `users` table

    return await query(({ users }) => {
      users.meta.foo = {
        bar: "baz",
        num: 3,
      }
      return JSON.stringify(users.meta);
    });
  },
}

export const Miscellaneous = {

  async Throw_error(message: string) {
    // Throw an error in the database with your message, you will see the error in the logs
    if (!message) return "Specify a message first";
    try {
      await query(({ }, { message }, { }) => {
        throw new Error(message);
      }, {
        message
      });
    } catch (err: any) {
      return err.message;
    }
  },
  async Print_hello_with_your_arguments(First_argument: string, Second_argument: string) {
    // You can add a descrition to the script with the comment

    if (!First_argument) First_argument = "Cow";
    if (!Second_argument) Second_argument = "Hello";
    return `${First_argument} says ${Second_argument}!`;
  },
}
