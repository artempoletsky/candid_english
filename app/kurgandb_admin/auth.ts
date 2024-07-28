
import { getSession } from "app/session/session";

import { login as fLogin, logout as fLogout } from "../api/auth/methods";
import { query } from "app/db";


export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  if (!session.user) {
    return false;
  }

  if (session.user.isAdmin) {
    return true;
  }

  const isRightsTableEmpty = await query(({ user_rights }) => {
    return user_rights.length == 0;
  });
  return isRightsTableEmpty;
  // if (isRightsTableEmpty) return true;

  // return session.user?.isAdmin || false;
}

export async function login(username: string, password: string): Promise<boolean> {
  return await fLogin({ username, password });
}

export async function logout(): Promise<void> {
  await fLogout();
}