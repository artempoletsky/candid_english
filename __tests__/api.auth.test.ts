

import { createOrGetUser } from "app/api/auth/methods";
import { query } from "app/db";
import { getSession } from "app/session/session";
// import {  } from "../app/(site)/session/session";
import zod from "zod";

jest.mock("../app/(site)/session/session");
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

  });

  afterAll(async () => {
    await query(({ users }, { idsToRemove }) => {
      users.where("username", ...idsToRemove).delete();
    }, { idsToRemove });
  });
});