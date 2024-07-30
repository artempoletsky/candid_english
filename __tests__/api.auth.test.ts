


import { createOrGetUser } from "app/api/auth/[...nextauth]/options";
import { updateUserInfo } from "../app/api/user/methods";
import { query } from "app/db";
import { getSession } from "app/session/session";
// import {  } from "../app/(site)/api/auth/[...nextauth]/adapter";
import zod from "zod";
import { loginCredentials, logout } from "app/kurgandb/lib/nextauthAdapter";

jest.mock("../app/(site)/session/session");
jest.mock("../app/(site)/api/auth/[...nextauth]/adapter");
describe("API auth", () => {
  // let plugin: Plugins["drill"];
  beforeAll(() => {

  });

  const idsToRemove: number[] = [];
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

    idsToRemove.push(user.id);

    user = (await createOrGetUser({
      email: "batman@arkham.com",
      image,
      name,
    })).user;

    idsToRemove.push(user.id);

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

  test("change password", async () => {
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
    let result = await loginCredentials(password: "qwerty1", username: "batman",);
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

  test("change username", async () => {
    let formerBatman = await updateUserInfo({
      password: "qwerty",
      newInfo: {
        username: "robin",
      }
    });
    expect(formerBatman.username).toBe("robin");
  });

  afterAll(async () => {
    await query(({ users }, { idsToRemove }) => {
      users.where("id", ...idsToRemove).delete();
    }, { idsToRemove });
  });
});