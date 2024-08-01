"use client";
import { fetchCatch, useErrorResponse } from "@artempoletsky/easyrpc/react";
import { Commentary } from "app/globals";
import ErrorMessage from "../ErrorMessage";
import { Button, TextInput, Textarea } from "@mantine/core";
import { useForm, UseFormReturnType, zodResolver } from "@mantine/form";
import { APostComment, postComment as zPostComment } from "../../../api/discussion/schemas";
import { rpc } from "app/rpc";
import { useStore } from "app/store";
import { useRef } from "react";

const { postComment } = rpc("discussion").methods("postComment");

type Props = {
  discussionId: number;
  onPost: (comment: Commentary) => void;
}

type FormWrapper = {
  form?: UseFormReturnType<{
    discussionId: number;
    text: string;
    guestName?: string | undefined;
  }, (values: {
    discussionId: number;
    text: string;
    guestName?: string | undefined;
  }) => {
    discussionId: number;
    text: string;
    guestName?: string | undefined;
  }>
}
export const formWrapper: FormWrapper = {
}
export default function FormPostComment({ discussionId, onPost }: Props) {
  const [user] = useStore("user");

  const refSelf = useRef<HTMLDivElement>(null);
  const refForm = useRef<HTMLFormElement>(null);

  const form = useForm<APostComment>({
    initialValues: {
      discussionId,
      guestName: "",
      text: "",
    },
    validate: zodResolver(zPostComment),
  });

  formWrapper.form = form;

  const [setErrorResponse, mainErrorMessage] = useErrorResponse(form);

  const fc = fetchCatch(postComment)
    .before<APostComment>(({ text, guestName }) => {
      return {
        guestName,
        discussionId,
        text,
      }
    })
    .catch(setErrorResponse)
    .then(comment => {
      refSelf.current!.appendChild(refForm.current!);
      form.setFieldValue("text", "");
      onPost(comment);
    });

  return <div ref={refSelf} id="FormContainer">
    <form ref={refForm} id="FormPostComment" action="#" onSubmit={form.onSubmit((values) => {
      fc.handle(values);
    })}>

      <p className="font-semibold text-gray-800">Add comment:</p>
      {!user && <TextInput
        label="Nickname"
        placeholder="optional"
        {...form.getInputProps("guestName")}
      />}
      <Textarea
        resize="vertical"
        label={<>Comment {form.getValues().text.length}/255</>}
        {...form.getInputProps("text")}
        className="mb-3"
        classNames={{
          input: "h-[150px]"
        }}
      />
      <Button type="submit">Post</Button>
      <ErrorMessage message={mainErrorMessage} />
    </form>
  </div>
}