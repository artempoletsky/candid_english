import { JSONErrorResponse, RPC } from "@artempoletsky/easyrpc/client";
import { API_ENDPOINT } from "kdb/generated";
import { TableComponentProps, adminRPCCustom } from "kdb/globals";
import type { customAPI, FSetCommentingMode } from "../api";
import TableMeta from "./TableMeta";
import { Select } from "@mantine/core";
import { CommentingMode, CommentingModes, CommentsMeta } from "app/globals";
import { TableScheme } from "@artempoletsky/kurgandb/globals";
import { useState } from "react";
import { fetchCatch, useErrorResponse } from "@artempoletsky/easyrpc/react";
import ErrorMessage from "components/ErrorMessage";


const setCommentingMode = adminRPCCustom().method("setCommentingMode");

type Props = {
  meta: CommentsMeta;
}
export default function CustomTableComments({ meta: metaInitial }: Props) {



  const fc = fetchCatch(setCommentingMode)
    .before((commentingMode: CommentingMode) => ({
      commentingMode
    }));

  // const { result: meta } = fc.useThen(metaInitial);
  const { errorMessage, result: meta } = fc.useThenCatch(metaInitial);

  return <div className="w-[550px]">
    <TableMeta meta={meta} />
    <Select
      className="w-[150px]"
      value={meta.commentingMode}
      data={CommentingModes}
      allowDeselect={false}
      onChange={val=>{
        fc.handle(val as any);
      }}
    />
    <ErrorMessage message={errorMessage} />
  </div>
}