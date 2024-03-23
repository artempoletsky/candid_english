"use client";

import { useVars, useErrorResponse } from "@artempoletsky/easyrpc/react";
import { Button, TextInput } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { getProviders, signIn } from "next-auth/react";
import { useEffect } from "react";
import z from "zod";

const zCredentials = z.object({
  username: z.string().min(5, "At least 5 symbols").max(35),
  password: z.string().min(5, "At least 5 symbols"),
});

type ACredentials = z.infer<typeof zCredentials>;

type Props = { onSignIn: () => void }
export default function PageGuest({ onSignIn }: Props) {
  // useEffect(() => {
  //   getProviders().then(console.log);
  //   // console.log("Providers", providers)
  // }, [])
  const form = useForm<ACredentials>({
    initialValues: {
      username: "",
      password: "",
    },
    validate: zodResolver(zCredentials),
  })
  const [setErrorResponse, mainErrorMessage] = useErrorResponse(form)
  function google() {
    signIn("google", {
      redirect: false,
    }).then(console.log);
  }

  function cred(credentials: ACredentials) {
    setErrorResponse();
    signIn("credentials", {
      ...credentials,
      redirect: false,
      callbackUrl: "/user",
    }).then((res) => {
      if (!res) {
        setErrorResponse({
          message: "Something wrong happened...",
          invalidFields: {},
          args: [],
          preferredErrorDisplay: "form",
          statusCode: 500,
        });
        return;
      }

      if (res.error) {
        setErrorResponse({
          message: "Wrong username or password {...}",
          invalidFields: {},
          args: [],
          preferredErrorDisplay: "form",
          statusCode: res.status,
        });
        return;
      }
      onSignIn();
    });
  }
  // const [credentials, h] = useVars({
  //   username: "username",
  //   password: "password",
  // });

  return <div>
    <form className="w-[350px]" autoComplete="on" action="/api/auth/signin" onSubmit={form.onSubmit(cred)}>
      <div className="">
        <TextInput
          {...form.getInputProps("username")}
          label="Username or password"
          autoComplete="on"
        />
      </div>
      <div className="">
        <TextInput
          {...form.getInputProps("password")}
          label="Password"
          type="password"
          autoComplete="on"
        />
      </div>
      <div className="mt-3">
        <Button type="submit">Sign in</Button>
      </div>
      <p className="min-h-[25px] text-red-500">{mainErrorMessage}</p>
    </form>

    <Button onClick={google}>Google</Button>
  </div>
}