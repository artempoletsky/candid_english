"use client";

import { useContext, useEffect, useState } from "react";
import { UserContext } from "./context";
import { UserSelf } from "~/globals";
import Link from "next/link";
import { Button } from "@mantine/core";
import { signOut } from "next-auth/react";

function renderUser(user: UserSelf) {
  const image = user.image;
  function onSignOut() {
    signOut({
      callbackUrl: "/",
    }).then(() => {
      localStorage.removeItem("user");
    });
  }
  return <div className="flex items-center gap-3">
    {image && <Link href="/user"><img className="rounded-full h-[42px]" src={image} /></Link>}
    <Link href="/user">{user.username}</Link>
    <Button onClick={onSignOut}>Sign out</Button>
    {/* <Link href="/user">sign out</Link> */}
  </div>
}

export default function HeaderUser() {
  const { user, setUser } = useContext(UserContext);
  useEffect(() => {
    if (!user) {
      const lsUser = window.localStorage.getItem("user");
      if (lsUser) {
        setUser(JSON.parse(lsUser));
      }
    } else {
      const lsUser = window.localStorage.getItem("user");
      if (!lsUser) {
        window.localStorage.setItem("user", JSON.stringify(user));
      }
    }
  }, [])

  return <div className="absolute right-3 top-0 px-3 py-3">
    {user
      ? renderUser(user)
      : <div className="py-2">
        <Link href="/user">Sign in</Link>
      </div>}

  </div>;
}