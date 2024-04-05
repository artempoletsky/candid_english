
import { API_UPLOAD_IMAGE, TestQuestion } from "app/globals";
import { DocumentComponentProps, bind } from "./CustomComponentRecord";
import { ReactNode, useState, DragEvent, ClipboardEvent } from "react";
import { Button, FileInput, Loader, Radio, RadioGroup, TextInput } from "@mantine/core";
import { adminRPCCustom } from "kdb/globals";


const removeTicketImage = adminRPCCustom().method("removeTicketImage");

async function uploadFile(file: File, id: number): Promise<string> {

  var data = new FormData();
  data.append("file", file);
  data.append("method", "saveExamTicketImage");
  data.append("ticketId", id + "");

  return fetch(API_UPLOAD_IMAGE, {
    method: "POST",
    body: data,
  }).then(e => {
    if (e.ok) {
      return e.json();
    } else {
      return new Promise((resolve, reject) => {
        e.json().then(reject);
      });
    }
  });
}

export default function CustomRecordTicket({ record, onRequestError }: DocumentComponentProps<TestQuestion>) {
  if (!record.options) return "";
  // console.log(record.difficulty);
  // console.log(record.options);

  // return "";
  function onChooseFile(file: File | null) {
    if (!file) return;
    onRequestError();
    setImageUploading(true);
    uploadFile(file, record.discussionId)
      .then(imageUrl => {
        setImageUploading(false);
        record.image = imageUrl
      })
      .catch(onRequestError)
  }

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
      options.push(<div key={`${i}${j}`} className="flex items-center gap-3">
        <Radio value={optionValue}></Radio>
        <TextInput value={optionValue} onChange={onOptionChange(i, j)} />
      </div>)
    }
    const correctIndex = record.correctAnswers[i];
    optionGroups.push(<RadioGroup key={`${i}`} value={g[correctIndex]} onChange={onCorrectChange(i)}>{options}</RadioGroup>)
  }

  function onImagePaste(e: ClipboardEvent<HTMLDivElement>) {
    const file = e.clipboardData.files[0];
    if (file) {
      e.preventDefault();
      onChooseFile(file);
    }
  }
  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);
    onChooseFile(e.dataTransfer.files[0]);
  }
  function onDragEnter(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(true);
  }
  function onDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);
  }
  const [dragActive, setDragActive] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  return <div className={`relative max-w-[550px]`}
    onPaste={onImagePaste}
    onDragOver={onDragEnter}
  >
    {/* <div className="absolute inset-0 z-10"></div> */}

    {dragActive && <div className="absolute inset-0 z-10 rounded outline outline-2 outline-blue-500" onDragLeave={onDragLeave} onDrop={onDrop}></div>}
    {optionGroups}

    {record.image && !imageUploading && <div className="my-3 flex items-center gap-3">
      <img height={200} width={200} alt="image" src={record.image + "?" + Math.random()} />
      <Button onClick={e => removeTicketImage({ id: record.discussionId }).then(() => { record.image = "" })} className="mt-3">Remove image</Button>
    </div>}

    {imageUploading && <Loader />}

    <div className="my-3" dangerouslySetInnerHTML={{ __html: record.explanation }}>
    </div>
    <FileInput value={null} onChange={onChooseFile} placeholder="Upload image" />

  </div>

}