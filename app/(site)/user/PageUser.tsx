"use client";

import { getAPIMethod } from "@artempoletsky/easyrpc/client";
import { fetchCatch, useErrorResponse } from "@artempoletsky/easyrpc/react";
import { useContext, useEffect, useState } from "react";
import { AuthData, Session, USER_ACTIONS_API, UserSelf } from "app/globals";
import PageGuest from "./PageGuest";
import { UserContext, UserStore } from "../components/context";
import { FGetMyPage, FRepeatConfirmationEmail, RGetMyPage } from "../api/user/methods";
import { Button, Tooltip } from "@mantine/core";
import FormUserData from "./FormUserData";


const getMyPage = getAPIMethod<FGetMyPage>(USER_ACTIONS_API, "getMyPage");
const repeatConfirmationEmail = getAPIMethod<FRepeatConfirmationEmail>(USER_ACTIONS_API, "repeatConfirmationEmail");


export default function TestComponent({ user: userInitial }: RGetMyPage) {


  const [setErrorResponse, mainErrorMessage, errorResponse] = useErrorResponse();
  // console.log(userContext);

  const user = useContext(UserContext);

  const [newEmailSent, setNewEmailSent] = useState(false);

  useEffect(() => {
    UserStore.setUser(userInitial);
  }, []);

  const fc = fetchCatch({
    errorCatcher: setErrorResponse
  });

  const onSignIn = fc.method(getMyPage)
    .then(({ user }) => {
      UserStore.setUser(user);
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