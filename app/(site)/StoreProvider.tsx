"use client";
import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useEffect, useState } from "react";
import { UserSelf } from "app/globals";
import { RPC, } from "@artempoletsky/easyrpc/client";
import type * as API from "./api/user/methods";
import { rpc } from "./rpc";
// import { BreadcrumbsArray } from "./layout";

export class Store {
  static setUser: Dispatch<SetStateAction<UserSelf | null>>;
}

export function useStore() {
  return useContext(StoreContext);
}

function createStore() {
  const [user, setUser] = useState<UserSelf | null>(null);
  Store.setUser = setUser;
  return { user };
}

const StoreContext = createContext<ReturnType<typeof createStore>>({
  user: null,
});

export type ChildrenProps = {
  children?: ReactNode;
}

const getMyPage = rpc("user").method("getMyPage");

export default function StoreProvider({ children }: ChildrenProps) {
  const store = createStore();
  useEffect(() => {
    getMyPage().then(({ user }) => {
      Store.setUser(user);
    });
  }, []);
  return (<StoreContext.Provider value={store}>
    {children}
  </StoreContext.Provider>);
}