"use client";

import { useErrorResponse, useVars } from "@artempoletsky/easyrpc/client";
import { Button, TextInput } from "@mantine/core";
import { getProviders, signIn } from "next-auth/react";
import { useEffect } from "react";

export default function PageGuest() {
  // useEffect(() => {
  //   getProviders().then(console.log);
  //   // console.log("Providers", providers)
  // }, [])
  const [setErrorResponse, mainErrorMessage] = useErrorResponse()
  function google() {
    signIn("google", {
      redirect: false,
    }).then(console.log);
  }

  function cred() {
    setErrorResponse();
    signIn("credentials", {
      ...credentials,
      redirect: false,
      callbackUrl: "/user",
    }).then((res) => {
      console.log(res);
      
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
          args: [res.error],
          preferredErrorDisplay: "form",
          statusCode: res.status,
        });
      }
    });
  }
  const [credentials, h] = useVars({
    username: "username",
    password: "password",
  });

  return <div>
    Hello Guest!
    <div className="">
      <TextInput {...h.props("username")} />
    </div>
    <div className="">
      <TextInput {...h.props("password")} type="password" />
    </div>
    <div className="">
      <Button onClick={cred}>Cred</Button>
    </div>
    <p className="min-h-[25px] text-red-500">{mainErrorMessage}</p>
    <Button onClick={google}>Google</Button>
  </div>
}