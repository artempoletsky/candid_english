"use client"

import { useRef } from "react"
import { getAPIMethod } from "@artempoletsky/easyrpc/client";
import Layout from "~/app/components/layout";
import { Button, Textarea } from "@mantine/core";

const API_ROUTE = "/admin/service/api";
const copySynonimsFromMongo = getAPIMethod(API_ROUTE, "copySynonimsFromMongo");
const queryExample = getAPIMethod(API_ROUTE, "queryExample");
const fillQuestionsTable = getAPIMethod(API_ROUTE, "fillQuestionsTable");
export default function Page() {
  let area = useRef<HTMLTextAreaElement>(null);


  return (
    <Layout>
      <h1>Control panel</h1>
      <div className="flex flex-col w-[400px] gap-2 mb-2">
        <Button onClick={e => copySynonimsFromMongo().then(console.log)}>Copy synonyms from MongoDB</Button>
        <Button className="btn" onClick={e => fillQuestionsTable().then(console.log)}>Fill questions table</Button>
      </div>
      <div className="flex justify-center gap-2">
        <div className="grow">
          <Textarea resize="vertical" className="w-full" ref={area}></Textarea>
        </div>
        <Button className="btn" onClick={e => queryExample().then(console.log)}>Send my db request</Button>
      </div>
    </Layout>
  )
}