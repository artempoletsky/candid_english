
import { getSession } from "app/session/session";

import { login as fLogin, logout as fLogout } from "app/api/auth/methods";


export async function isAdmin(): Promise<boolean> {
  const session = await getSession();

  return session.user?.isAdmin || false;
}

export async function login(username: string, password: string): Promise<boolean> {
  return await fLogin({ username, password });
}

export async function logout(): Promise<void> {
  await fLogout();
}