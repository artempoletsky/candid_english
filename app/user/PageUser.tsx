"use client";

import { fetchCatch, getAPIMethod, useErrorResponse } from "@artempoletsky/easyrpc/client";
import type { FSayHello } from "./api/methods";
import { useState } from "react";
import { Session, UserFull } from "~/globals";
import PageGuest from "./PageGuest";
import { signOut } from "next-auth/react";
import { Button } from "@mantine/core";

const sayHello = getAPIMethod<FSayHello>("/user/api", "sayHello");


type Props = {
  // user: UserFull;
};

export default function TestComponent({ user, authUser, isAdmin }: Session) {

  const [setErrorResponse, mainErrorMessage, errorResponse] = useErrorResponse();
  if (!user) return <PageGuest />;

  const image = user.image || authUser?.image || "";
  function onSignOut() {
    signOut().then(console.log);
  }
  return (
    <div className="">
      <p className="">Hello {user.fullName || user.username}!</p>
      {isAdmin && <p className="">You are admin</p>}
      {image && <img src={image} />}
      <div className="text-red-600 min-h-[24px]">{mainErrorMessage}</div>
      <Button onClick={onSignOut}>Logout</Button>
    </div >
  );
}