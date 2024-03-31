
import PageUser from "./PageUser";
import { Metadata } from "next";

import PageLayout from "components/PageLayout";
import ComponentLoader from "components/ComponentLoader";
import { API_USER_ACTIONS } from "app/globals";
import { FGetMyPage } from "app/api/user/methods";

export const metadata: Metadata = {
  title: "",
};

type Props = {};
export default async function (props: Props) {
  const method = API_USER_ACTIONS + "?getMyPage" as unknown as FGetMyPage;
  return (
    <ComponentLoader
      Component={PageUser}
      method={method}
      args={{}}
    />
  );
}
