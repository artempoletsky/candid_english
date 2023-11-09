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