

import { createOrGetUser, login, logout } from "app/api/auth/methods";
import { updateUserInfo } from "app/api/user/methods";
import { query } from "app/db";
import { getSession } from "app/session/session";
// import {  } from "../app/(site)/api/auth/[...nextauth]/adapter";
import zod from "zod";

jest.mock("../app/(site)/session/session");
jest.mock("../app/(site)/api/auth/[...nextauth]/adapter");
describe("API auth", () => {
  // let plugin: Plugins["drill"];
  beforeAll(() => {

  });

  const idsToRemove: string[] = [];
  test("createOrGetUser", async () => {
    const email = "batman@gotham.com";
    const image = "https://gotham.com/profilepic/123123";
    const name = "Bruce Wayne";

    let { user } = await createOrGetUser({
      email,
      image,
      name,
    });

    expect(user.emailVerified).toBe(true);
    expect(user.email).toBe(email);
    expect(user.image).toBe(image);
    expect(user.fullName).toBe(name);
    expect(user.username).toBe("batman");

    idsToRemove.push("batman");

    user = (await createOrGetUser({
      email: "batman@arkham.com",
      image,
      name,
    })).user;

    idsToRemove.push(user.username);

    expect(user.email).toBe("batman@arkham.com");
    expect(user.username).toBe("batman1");

    const session = await getSession();
    expect(session.user).toBeDefined();
    expect(session.user?.username).toBe("batman1");

    await createOrGetUser({
      email,
      image,
      name,
    });
  });

  test("changePassword", async () => {
    let batman = await updateUserInfo({
      password: undefined,
      newInfo: {
        password: "qwerty",
      }
    });
  });

  test("logout", async () => {
    await logout();
    const session = await getSession();
    expect(session.user).toBe(undefined)
  });

  test("login with credentials", async () => {
    let result = await login({
      password: "qwerty1",
      username: "batman",
    });
    let session = await getSession();
    expect(result).toBe(false);
    expect(session.user).toBe(undefined);

    result = await login({
      password: "qwerty",
      username: "batman",
    });
    expect(result).toBe(true);
    

    expect(session.user?.email).toBe("batman@gotham.com");
  });

  afterAll(async () => {
    await query(({ users }, { idsToRemove }) => {
      users.where("username", ...idsToRemove).delete();
    }, { idsToRemove });
  });
});