"use client";

import { rpc } from "app/rpc";
import Discussion from "./Discussion";
import { useEffect, useState } from "react";
import { Loader } from "@mantine/core";
import { useErrorResponse } from "@artempoletsky/easyrpc/react";
import ErrorMessage from "components/ErrorMessage";
import { Commentary } from "app/globals";
import ReplyOP from "./ReplyOP";

type Props = {
  discussionId: number;
  className?: string;
}
const getDiscussion = rpc("discussion").method("getDiscussion");

export default function DiscussionAJAX(props: Props) {
  const [loading, setLoading] = useState(true);
  const [errorSetter, , errorResponse] = useErrorResponse();
  const [comments, setComments] = useState<Commentary[]>([])
  useEffect(() => {
    errorSetter();
    setLoading(true);
    getDiscussion({
      discussionId: props.discussionId,
    }).then(res => {
      setLoading(false);
      setComments(res);
    }).catch(errorSetter);
  }, [props.discussionId]);

  if (errorResponse) return <ErrorMessage requestError={errorResponse} />
  if (loading) {
    return <Loader type="dots" />
  }
  return <>
    <ReplyOP />
    <Discussion {...props} comments={comments} />
  </>
}