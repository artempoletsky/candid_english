import { getSession } from "app/session/__mocks__/session";
import { createOrGetUser } from "../../methods";




export async function authRequest(url: string, payload: Record<string, string>): Promise<any> {
  // console.log(url, payload);
  // debugger;
  if (url == "/api/auth/callback/credentials") {
    const authUser = await authorize({
      username: payload.username,
      password: payload.password,
    });



    if (authUser) {
      await createOrGetUser(authUser);
    } else {
      return {
        status: 401,
        json: () => Promise.resolve({
          url: "/user"
        }),
        ok: false,
        headers: {} as any,
      }
    }
  }
  return {
    status: 200,
    json: () => Promise.resolve({
      url: "/user"
    }),
    ok: true,
    headers: {} as any,
  }
}

export async function authorize(credentials: Record<"username" | "password", string>) {
  if (credentials.password == "qwerty") {
    return {
      id: "",
      email: "batman@gotham.com",
      name: "",
      image: "",
    };
  }
  return null;
}