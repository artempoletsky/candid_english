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

export function dictToArr(dict: Record<string, Object>, idField = "id"): any[] {
  const result = [];
  for (const key in dict) {
    result.push({
      [idField]: key,
      ...dict[key]
    })
  }
  return result;
}

export function arrToDict(array: Object[], idField = "id", removeId = true): Record<string, any> {
  let result: Record<string, any> = {};
  for (const item of array) {
    const id = (item as any)[idField];
    result[id] = {
      ...item
    }
    if (removeId) {
      delete result[id][idField];
    }
  }
  return result;
}


export type PlainObject = Record<string, any>