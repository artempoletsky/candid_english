
import { API_UPLOAD_IMAGE, TestQuestion } from "app/globals";
import { DocumentComponentProps, bind } from "./CustomComponentRecord";
import { ReactNode } from "react";
import { Button, FileInput, Radio, RadioGroup, TextInput } from "@mantine/core";
import Image from "next/image";
import { getAPIMethod } from "@artempoletsky/easyrpc/client";
import type { FRemoveTicketImage } from "kdbUser/api";
import { API_ENDPOINT } from "kdb/generated";

const removeTicketImage = getAPIMethod<FRemoveTicketImage>(API_ENDPOINT, "removeTicketImage");

function uploadFile(file: File, id: number): Promise<string> {

  var data = new FormData();
  data.append("file", file);
  data.append("method", "saveExamTicketImage");
  data.append("ticketId", id + "");

  return fetch(API_UPLOAD_IMAGE, {
    method: "POST",
    body: data,
  }).then(e => e.json());
}

export default function CustomRecordTicket({ record }: DocumentComponentProps<TestQuestion>) {
  if (!record.options) return "";
  // console.log(record.difficulty);
  // console.log(record.options);

  // return "";
  function onOptionChange(i: number, j: number) {
    return function (e: any) {
      record.options[i][j] = e.target.value;
      record.options = record.options.slice(0);
    }
  }

  function onCorrectChange(i: number) {
    return function (e: string) {
      const iOf = record.options[i].indexOf(e);
      record.correctAnswers[i] = iOf;
      record.correctAnswers = record.correctAnswers.slice(0);
    }
  }
  const optionGroups: ReactNode[] = [];
  for (let i = 0; i < record.options.length; i++) {
    const g = record.options[i];
    const options: ReactNode[] = [];
    for (let j = 0; j < g.length; j++) {
      const optionValue = g[j];
      options.push(<div className="flex items-center gap-3">
        <Radio value={optionValue}></Radio>
        <TextInput value={optionValue} onChange={onOptionChange(i, j)} />
      </div>)
    }
    const correctIndex = record.correctAnswers[i];
    optionGroups.push(<RadioGroup value={g[correctIndex]} onChange={onCorrectChange(i)}>{options}</RadioGroup>)
  }
  return <div className="max-w-[550px]">
    {optionGroups}
    <div className="my-3">
      {record.image && <Image height={200} width={200} alt="image" src={record.image + "?" + Math.random()} />}
    </div>

    <div className="my-3" dangerouslySetInnerHTML={{ __html: record.explanation }}>
    </div>
    <FileInput value={null} onChange={file => {
      if (!file) return;
      uploadFile(file, record.discussionId).then(imageUrl => record.image = imageUrl);
      // setFileToUpload(file);
    }} placeholder="Upload image" />
    <Button onClick={e => removeTicketImage({ id: record.discussionId }).then(() => { record.image = "" })} className="mt-3">Remove image</Button>
  </div>

}