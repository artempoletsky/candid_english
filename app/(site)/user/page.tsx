
import PageUser from "./PageUser";
import { Metadata } from "next";

import PageLayout from "components/PageLayout";
import ComponentLoader from "components/ComponentLoader";
import { USER_ACTIONS_API } from "app/globals";
import { FGetMyPage } from "app/api/user/methods";

export const metadata: Metadata = {
  title: "",
};

type Props = {};
export default async function (props: Props) {
  const method = USER_ACTIONS_API + "?getMyPage" as unknown as FGetMyPage;
  return (
    <ComponentLoader
      Component={PageUser}
      method={method}
      args={{}}
    />
  );
}
