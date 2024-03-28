
import { Session } from "app/globals";

export async function getSession(): Promise<Session> {
  return {
    id: "123",
    englishLevel: "",
  }
}