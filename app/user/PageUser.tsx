"use client";

import { getAPIMethod } from "@artempoletsky/easyrpc/client";
import { fetchCatch, useErrorResponse } from "@artempoletsky/easyrpc/react";
import { useContext, useEffect, useState } from "react";
import { AuthData, Session, USER_ACTIONS_API, UserSelf } from "~/globals";
import PageGuest from "./PageGuest";
import { UserContext } from "../components/context";
import { FGetMyPage, FRepeatConfirmationEmail, RGetMyPage } from "../api/user/methods";
import { Button, Tooltip } from "@mantine/core";
import { blinkBoolean } from "~/lib/utils_client";


const getMyPage = getAPIMethod<FGetMyPage>(USER_ACTIONS_API, "getMyPage");
const repeatConfirmationEmail = getAPIMethod<FRepeatConfirmationEmail>(USER_ACTIONS_API, "repeatConfirmationEmail");


export default function TestComponent({ user: userInitial, authUser, isAdmin: isAdminInitial }: RGetMyPage) {


  const [setErrorResponse, mainErrorMessage, errorResponse] = useErrorResponse();
  // console.log(userContext);

  const { user, setUser } = useContext(UserContext);
  const [isAdmin, setIsAdmin] = useState(isAdminInitial);
  const [newEmailSent, setNewEmailSent] = useState(false);

  useEffect(() => {
    setUser(userInitial);
    localStorage.removeItem("user");
    if (user) localStorage.setItem("user", JSON.stringify(user));
  }, []);

  const fc = fetchCatch({
    errorCatcher: setErrorResponse
  });

  const onSignIn = fc.method(getMyPage)
    .then(({ user, isAdmin }) => {
      setUser(user);
      setIsAdmin(isAdmin);
    }).action();


  if (!user) return <PageGuest onSignIn={onSignIn} />;


  const repeatEmail = fc.method(repeatConfirmationEmail)
    .then(() => {
      // blinkBoolean(setNewEmailSent);
      setNewEmailSent(true);
    }).action();

  return (
    <div className="">
      <p className="">Hello {user.fullName || user.username}!</p>
      {isAdmin && <p className="">You are admin</p>}
      {!user.emailConfirmed && <div>
        <div className="text-red-600 mb-3">Please confirm you email {user.email}!</div>
        <div className="">
          {!newEmailSent ? <Button onClick={repeatEmail}>Send a new email</Button> : "Sent!"}
        </div>
      </div>}
      <div className="text-red-600 min-h-[24px]">{mainErrorMessage}</div>
    </div >
  );
}