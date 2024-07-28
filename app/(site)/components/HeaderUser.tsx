"use client";

import { useContext, useEffect, useState } from "react";
import { UserSelf } from "app/globals";
import Link from "next/link";
import { Button } from "@mantine/core";
import { signOut } from "next-auth/react";
import { FGetMyPage } from "../../api/user/methods";
import { useStore } from "app/store";


function RenderUser(user: UserSelf, onLogout: () => void) {
  const image = user.image;
  function onSignOut() {
    signOut({
      callbackUrl: "/",
    }).then(onLogout);
  }
  return <div className="flex justify-center items-center gap-3">
    {image && <Link className="shrink-0" href="/user"><img alt="avatar" className="rounded-full h-[42px]" src={image} /></Link>}
    <Link href="/user">{user.username}</Link>
    <Button className="shrink-0" onClick={onSignOut}>Sign out</Button>
    {/* <Link href="/user">sign out</Link> */}
  </div>
}



export default function HeaderUser() {
  const [user, setUser] = useStore("user");
  
  return <div className="whitespace-nowrap md:pr-3 py-3">
    {user
      ? RenderUser(user, () => {
        setUser(null);
      })
      : <div className="">
        <Link href="/user">Sign in</Link>
      </div>}

  </div>;
}