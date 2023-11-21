import fs from "fs";
const CWD = process.cwd();

type WFSOptions = {
  pretty: boolean
} | undefined;

export function wfs(filename: string, data: any, options?: WFSOptions) {
  const { pretty = false } = options || {};

  if (pretty) {
    return fs.writeFileSync(CWD + filename, JSON.stringify(data, null, 2).replace(/\n/g, "\r\n"));
  } else {
    return fs.writeFileSync(CWD + filename, JSON.stringify(data));
  }
}

export function rfs(filename: string) {
  return JSON.parse(fs.readFileSync(CWD + filename, { encoding: "utf8" }));
}

export function createIfNotExists(filename: string, data?: any): boolean {
  if (fs.existsSync(CWD + filename)) {
    return true;
  }
  const dataToWrite = data ? JSON.stringify(data) : '';
  fs.writeFileSync(CWD + filename, dataToWrite);
  return false;
}



import { MongoClient, ServerApiVersion, Db } from "mongodb";
import { MONGO_CONNECTION_STRING, MONGO_DBNAME } from "./paths";



let client: MongoClient;
let myDB: Db;

export async function dbConnect() {
  client = new MongoClient(MONGO_CONNECTION_STRING, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  }
  );
  let connected = client.connect();
  await connected;
  myDB = client.db(MONGO_DBNAME);
  return myDB;
};


export function getCollection(name: string) {
  return myDB.collection(name);
};


export function closeDBConnection() {
  return client.close();
};