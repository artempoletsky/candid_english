import sharp, { Sharp } from "sharp";
import fs from "fs";
import { ResponseError } from "@artempoletsky/easyrpc";

export async function save(destination: string, file: File, size: number) {
  const result = `${destination}_${size}.jpg`;
  await (await createSharp(file, size)).toFile(`${process.cwd()}/public${result}`);
  return result;
}

export async function saveAvatar(userId: number, file: File) {
  return save(`/profilepic/${userId}`, file, 200);
}

async function createSharp(file: File, size: number) {
  let image: Sharp;
  try {
    image = sharp(await file.arrayBuffer());
    await image.metadata();
  } catch (error) {
    throw new ResponseError("wrong image format");
  }
  return image.resize(size).jpeg();
}

export async function saveExamTicketImage(id: number, file: File) {
  return save(`/exam/${id}`, file, 400);
}


export async function removeExamTicketImage(id: number) {
  const filename = `${process.cwd()}/public/exam/${id}_400.jpg`;
  if (fs.existsSync(filename))
    fs.unlinkSync(filename);
}