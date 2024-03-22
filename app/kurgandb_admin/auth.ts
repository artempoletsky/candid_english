
import { getSession } from "../session/session";

import { login as fLogin, logout as fLogout } from "../api/auth/methods";


export async function isAdmin(): Promise<boolean> {
  // return true;
  const session = await getSession();
  return session.isAdmin;
}

export async function login(username: string, password: string): Promise<boolean> {
  return await fLogin({ username, password });
}

export async function logout(): Promise<void> {
  await fLogout();
}