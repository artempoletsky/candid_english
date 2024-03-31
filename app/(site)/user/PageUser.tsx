"use client";

import { getAPIMethod } from "@artempoletsky/easyrpc/client";
import { fetchCatch, useErrorResponse } from "@artempoletsky/easyrpc/react";
import { useContext, useEffect, useState } from "react";
import { AuthData, Session, API_USER_ACTIONS, UserSelf } from "app/globals";
import PageGuest from "./PageGuest";
import { FGetMyPage, FRepeatConfirmationEmail, RGetMyPage } from "../api/user/methods";
import { Button, Tooltip } from "@mantine/core";
import FormUserData from "./FormUserData";
import { Store, useStore } from "app/StoreProvider";
import LanguageLevel from "components/LanguageLevel";
import Link from "next/link";

const getMyPage = getAPIMethod<FGetMyPage>(API_USER_ACTIONS, "getMyPage");
const repeatConfirmationEmail = getAPIMethod<FRepeatConfirmationEmail>(API_USER_ACTIONS, "repeatConfirmationEmail");


export default function TestComponent({ user: userInitial }: RGetMyPage) {


  const [setErrorResponse, mainErrorMessage, errorResponse] = useErrorResponse();
  // console.log(userContext);

  const { user } = useStore();

  const [newEmailSent, setNewEmailSent] = useState(false);

  useEffect(()=>{
    Store.setUser(userInitial);
  }, []);
  

  const fc = fetchCatch({
    errorCatcher: setErrorResponse
  });

  const onSignIn = fc.method(getMyPage)
    .then(({ user }) => {
      Store.setUser(user);
    }).action();


  if (!user) return <PageGuest onSignIn={onSignIn} />;


  const repeatEmail = fc.method(repeatConfirmationEmail)
    .then(() => {
      setNewEmailSent(true);
    }).action();

  return (
    <div className="">
      <p className="mb-3">Hello {user.fullName || user.username}!</p>
      {user.isAdmin && <p className="text-rose-600 mb-3">You are admin</p>}
      <p className="mb-2">Your English level is: </p>
      <LanguageLevel size="lg" level={user.englishLevel} />
      {user.englishLevel !== "c2" && <p className="mt-2">
        You can improve your score by <Link href="/test">taking our test</Link>
      </p> }
      <p className="mt-1">You know {user.wordsCount} English words</p>
      {!user.emailVerified && <div>
        <div className="text-red-600 mb-3">Please confirm your email {user.email}!</div>
        <div className="">
          {!newEmailSent ? <Button onClick={repeatEmail}>Send a new email</Button> : "Sent!"}
        </div>
      </div>}
      <FormUserData user={user} />
      <div className="text-red-600 min-h-[24px]">{mainErrorMessage}</div>
    </div >
  );
}