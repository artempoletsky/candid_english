"use client";
import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useEffect, useState } from "react";
import { API_USER_ACTIONS, UserSelf } from "app/globals";
import { getAPIMethod } from "@artempoletsky/easyrpc/client";
import { FGetMyPage } from "./api/user/methods";
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

const getMyPage = getAPIMethod<FGetMyPage>(API_USER_ACTIONS, "getMyPage");
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