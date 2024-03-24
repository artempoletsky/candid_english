
import PageUser from "./PageUser";
import { Metadata } from "next";

import PageLayout from "@/PageLayout";
import ComponentLoader from "@/ComponentLoader";
import { USER_ACTIONS_API } from "~/globals";
import { FGetMyPage } from "~/app/api/user/methods";

export const metadata: Metadata = {
  title: "",
};

type Props = {};
export default async function (props: Props) {
  const method = USER_ACTIONS_API + "?getMyPage" as unknown as FGetMyPage;
  return (
    <PageLayout>
      <h1>{metadata.title as string}</h1>
      <ComponentLoader
        Component={PageUser}
        method={method}
        args={{}}
      />
    </PageLayout>
  );
}
