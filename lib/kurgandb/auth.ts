
import { getServerSession } from "next-auth";
import options from "../../app/api/auth/[...nextauth]/options";

import * as adapter from "../../app/kurgandb/lib/nextauthAdapter";

export async function isAdmin(): Promise<boolean> {
  const session: any = await getServerSession(options);
  return session?.isAdmin || false;
}


export async function login(username: string, password: string): Promise<boolean> {
  return await adapter.loginCredentials(username, password);
}

export async function logout(): Promise<void> {
  await adapter.logout();
}