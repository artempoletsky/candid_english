
import { Dispatch, SetStateAction, createContext, useState } from "react";
import { UserSelf } from "~/globals";

// const [user, setUser] = useState<UserSelf | null>(null);
export const UserContext = createContext<{
  user: UserSelf | null;
  setUser: Dispatch<SetStateAction<UserSelf | null>>;
}>({ user: null, setUser: () => { } } as any);