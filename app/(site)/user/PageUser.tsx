"use client";

import { fetchCatch, useErrorResponse } from "@artempoletsky/easyrpc/react";
import { useContext, useEffect, useState } from "react";
import PageGuest from "./PageGuest";
import { FGetMyPage, FRepeatConfirmationEmail, RGetMyPage } from "../api/user/methods";
import { Button, Tooltip } from "@mantine/core";
import FormUserData from "./FormUserData";
import LanguageLevel from "components/LanguageLevel";
import Link from "next/link";
import { rpc } from "app/rpc";
import { useStore } from "app/store";

const { getMyPage, repeatConfirmationEmail } = rpc("user").methods("getMyPage", "repeatConfirmationEmail");

export default function PageUser({ user: userInitial }: RGetMyPage) {


  const [setErrorResponse, mainErrorMessage, errorResponse] = useErrorResponse();
  // console.log(userContext);

  const [user, setUserStore] = useStore("user");

  const [newEmailSent, setNewEmailSent] = useState(false);

  useEffect(() => {
    setUserStore(userInitial);
  }, []);


  const fc = fetchCatch({
    errorCatcher: setErrorResponse
  });

  const onSignIn = fc.method(getMyPage)
    .then(({ user }) => {
      setUserStore(user);
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
      </p>}
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