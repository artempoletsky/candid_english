import { ResponseError } from "@artempoletsky/easyrpc";
import { getSession } from "app/session/session";
import { NextRequest, NextResponse } from "next/server";
import { saveAvatar, saveExamTicketImage } from "./methods_image";
import z from "zod";


const zId = z.coerce.number().int();

async function post(req: NextRequest) {
  const session = await getSession();
  const user = session.user;
  if (!user) throw new ResponseError("authorization is required");

  let formData = await req.formData();
  let file: File = formData.get("file") as File;
  const method = formData.get("method")?.toString();
  if (!file) {
    throw new ResponseError("file is required");
  }

  if (!method) {
    throw new ResponseError("method is required");
  }

  if (method == "saveAvatar") {
    return await saveAvatar(user.id, file);
  } else if (method == "saveExamTicketImage") {
    if (!user.isAdmin) throw new ResponseError("admin rights is required");

    let id: number;
    try {
      id = zId.parse(formData.get("ticketId"));
    } catch (err) {
      throw new ResponseError("wrong ticketId");
    }
    return await saveExamTicketImage(id, file);
  }

  throw new ResponseError("method is not supported");
}






export async function POST(req: NextRequest) {

  let result: string;
  try {
    result = await post(req);
  } catch (err) {
    if (err instanceof ResponseError) {
      return NextResponse.json(err.response, { status: err.statusCode });
    }
    throw err;
  }

  return NextResponse.json(result, {
    status: 200
  });
}