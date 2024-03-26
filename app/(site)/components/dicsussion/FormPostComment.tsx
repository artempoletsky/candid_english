"use client";
import { fetchCatch, useErrorResponse } from "@artempoletsky/easyrpc/react";
import { Comment } from "app/globals";
import ErrorMessage from "../ErrorMessage";
import { Button, TextInput, Textarea } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { APostComment, postComment as zPostComment } from "app/api/discussion/schemas";
import { getAPIMethod } from "@artempoletsky/easyrpc/client";
import type { FPostComment } from "app/api/discussion/methods";
import { useContext } from "react";
import { UserContext } from "../context";

const postComment = getAPIMethod<FPostComment>("/api/discussion", "postComment");

type Props = {
  discussionId: number;
  onPost: (comment: Comment) => void;
}
export default function FormPostComment({ discussionId, onPost }: Props) {
  const user = useContext(UserContext);
  const [setErrorResponse, mainErrorMessage] = useErrorResponse();
  const form = useForm<APostComment>({
    initialValues: {
      discussionId,
      guestName: "",
      text: "",
    },
    validate: zodResolver(zPostComment),
  });

  const fc = fetchCatch(postComment)
    .before(({ text, guestName }) => {
      return {
        guestName,
        discussionId,
        text,
      }
    })
    .catch(setErrorResponse)
    .then(comment => {
      form.setFieldValue("text", "");
      onPost(comment);
    });

  function onSubmit(params: APostComment) {
    fc.action(params)();
  }
  return <form action="#" onSubmit={form.onSubmit(onSubmit)}>
    <p className="font-semibold text-gray-800">Add comment:</p>
    {!user && <TextInput
      label="Nickname"
      placeholder="optional"
      {...form.getInputProps("guestName")}
    />}
    <Textarea
      resize="vertical"
      label="Comment"
      {...form.getInputProps("text")}
      className="mb-3"
    />
    <Button type="submit">Post</Button>
    <ErrorMessage message={mainErrorMessage} />
  </form>
}