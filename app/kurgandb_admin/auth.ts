import { query } from "~/db";
import { getSession } from "../session/route";




export async function isAdmin(): Promise<boolean> {
  // return true;
  const session = getSession();
  return session.isAdmin;
}

function sleep(time: number = 200) {
  return (new Promise((resolve) => {
    setTimeout(resolve, time);
  }));
}

export async function login(username: string, password: string): Promise<boolean> {
  const session = getSession();


  const [success, isAdmin] = await query(({ user_rights, users }, payload, { $ }) => {
    let isAdmin = false;
    let success = false;
    if (user_rights.has(payload.username)) {
      isAdmin = user_rights.at(payload.username, d => d.isAdmin);
    }
    if (users.has(payload.username)) {
      const pwd = users.at(payload.username, u => u.$get("password"));
      success = $.encodePassword(payload.password) == pwd;
    }
    return [success, isAdmin]
  }, { username, password });


  if (success) {
    session.isAdmin = isAdmin;
    session.username = username;
  }

  await sleep();
  return success;
}

export async function logout(): Promise<void> {
  const session = getSession();
  session.isAdmin = false;
  session.username = undefined;
  await sleep();
  // return undefined;
}