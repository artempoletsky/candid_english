"use client";

import { fetchCatch, getAPIMethod, useErrorResponse } from "@artempoletsky/easyrpc/client";
import { useContext, useEffect, useState } from "react";
import { Session } from "~/globals";
import PageGuest from "./PageGuest";
import { UserContext } from "../components/context";
import { FGetPage } from "./api/methods";

const getPage = getAPIMethod<FGetPage>("/user/api/", "getPage");

type Props = {
  // user: UserFull;
};

export default function TestComponent({ user: userInitial, authUser, isAdmin }: Session) {


  const [setErrorResponse, mainErrorMessage, errorResponse] = useErrorResponse();
  // console.log(userContext);

  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
    setUser(userInitial || null);
    localStorage.removeItem("user");
    if (user) localStorage.setItem("user", JSON.stringify(user));
  }, []);

  const onSignIn = fetchCatch(getPage)
    .catch(setErrorResponse)
    .then(({ user }) => {
      setUser(user || null);
    }).action();

  if (!user) return <PageGuest onSignIn={onSignIn} />;

  return (
    <div className="">
      <p className="">Hello {user.fullName || user.username}!</p>
      {isAdmin && <p className="">You are admin</p>}
      <div className="text-red-600 min-h-[24px]">{mainErrorMessage}</div>
    </div >
  );
}