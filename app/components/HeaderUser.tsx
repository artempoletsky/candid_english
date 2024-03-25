"use client";

import { useContext, useEffect, useState } from "react";
import { UserContext, UserStore } from "./context";
import { USER_ACTIONS_API, UserSelf } from "~/globals";
import Link from "next/link";
import { Button } from "@mantine/core";
import { signOut } from "next-auth/react";
import { getAPIMethod } from "@artempoletsky/easyrpc/client";
import { FGetMyPage } from "../api/user/methods";

function renderUser(user: UserSelf) {
  const image = user.image;
  function onSignOut() {
    signOut({
      callbackUrl: "/",
    }).then(() => {
      UserStore.setUser(null);
    });
  }
  return <div className="flex items-center gap-3">
    {image && <Link href="/user"><img className="rounded-full h-[42px]" src={image} /></Link>}
    <Link href="/user">{user.username}</Link>
    <Button onClick={onSignOut}>Sign out</Button>
    {/* <Link href="/user">sign out</Link> */}
  </div>
}

const getMyPage = getAPIMethod<FGetMyPage>(USER_ACTIONS_API, "getMyPage");

export default function HeaderUser() {
  const user = useContext(UserContext);
  const [loading, setLoading] = useState(user ? false : true);
  useEffect(() => {
    UserStore.setUser(UserStore.getUser());
    setLoading(false);
    // getMyPage().then(({ user }) => {
    //   UserStore.setUser(user);
    //   setLoading(false);
    // });
  }, []);
  if (loading) return "";
  return <div className="absolute right-3 top-0 px-3 py-3">
    {user
      ? renderUser(user)
      : <div className="py-2">
        <Link href="/user">Sign in</Link>
      </div>}

  </div>;
}