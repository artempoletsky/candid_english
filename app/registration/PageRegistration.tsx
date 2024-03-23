"use client";

import { getAPIMethod } from "@artempoletsky/easyrpc/client";
import { fetchCatch, useErrorResponse } from "@artempoletsky/easyrpc/react";

import { ChangeEvent, ChangeEventHandler, useRef, useState } from "react";
import { ARegister, register as ZRegister } from "./api/schemas";
import { useForm, zodResolver } from "@mantine/form";
import type { FRegister } from "./api/methods";
import { Button } from "@mantine/core";
import TextInput from "./Textnput";

const register = getAPIMethod<FRegister>("/registration/api", "register");


type Props = {};
export default function TestComponent(props: Props) {
  const [completed, setCompleted] = useState(false);


  const form = useForm<ARegister>({
    initialValues: {
      email: "",
      username: "",
      password: "",
      passwordConfirmation: "",
    },
    validate: zodResolver(ZRegister),
  });

  const [setErrorResponse, mainErrorMessage, errorResponse] = useErrorResponse(form);
  const [usernameTouched, setUsernameTouched] = useState(false);

  const fcHandleSubmit = fetchCatch(register)
    .before((arg: ARegister) => arg)
    .catch(setErrorResponse)
    .then(setCompleted);

  function handleSubmit(arg: ARegister) {
    fcHandleSubmit.action(arg)();
  }

  function onEmailChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    form.setFieldValue("email", value);
    if (!usernameTouched) {

      let username = value ? (value.match(/^[^@]+/) as string[])[0] : "";
      form.setFieldValue("username", username);
    }
  }

  if (completed)
    return <div>
      <p>Success!</p>
      <p>The confirmation code has been sent to your email.</p>
    </div>
  return (
    <form className="" onSubmit={form.onSubmit(handleSubmit)}>
      <div className="">
        <TextInput {...form.getInputProps("email")} onChange={onEmailChange} label="E-mail" />
        <TextInput {...form.getInputProps("username")} onFocus={e => setUsernameTouched(true)} label="Username" />
        <TextInput {...form.getInputProps("password")} type="password" label="Password" />
        <TextInput {...form.getInputProps("passwordConfirmation")} type="password" label="Confirm password" />
        <Button type="submit">Create new account</Button>
      </div>
      <div className="text-red-600 min-h-[24px]">{mainErrorMessage}</div>
    </form>
  );
}