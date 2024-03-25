
import { Dispatch, SetStateAction, createContext, useState } from "react";
import { UserSelf } from "~/globals";

export class UserStore {
  static setter?: Dispatch<SetStateAction<UserSelf | null>>;
  static setUser(user: UserSelf | null) {
    localStorage.removeItem("user");
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
    if (this.setter) {
      this.setter(user);
    }
  }
  static getUser(): UserSelf | null {
    if (!window) return null;
    const item = localStorage.getItem("user");
    if (!item) return null;
    return JSON.parse(item);
  }
}

export const UserContext = createContext<UserSelf | null>(null);