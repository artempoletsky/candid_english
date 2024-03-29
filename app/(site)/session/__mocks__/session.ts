
import { Session } from "app/globals";

const session: Session = {
  id: "123",
  englishLevel: "",
};
export async function getSession(): Promise<Session> {
  return session;
}