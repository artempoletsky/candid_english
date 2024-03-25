"use client";

import Header from "./Header";
import { UserContext, UserStore } from "./context";
import Footer from "./footer";

import { useState } from 'react';
import { UserSelf } from '~/globals';

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<UserSelf | null>(null);
  UserStore.setter = setUser;
  return (

    <UserContext.Provider value={user}>
      <Header></Header>
      <div className="grow">
        <div className="px-9 mx-auto max-w-[950px]">{children}</div>
      </div>
      <Footer></Footer>
    </UserContext.Provider >
  )
}