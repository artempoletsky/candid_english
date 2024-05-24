
import PageUser from "./PageUser";
import { Metadata } from "next";

import ComponentLoader from "components/ComponentLoader";
import { FGetMyPage } from "app/api/user/methods";
import { rpc } from "app/rpc";


export const metadata: Metadata = {
  title: "",
};

type Props = {};
export default async function Page(props: Props) {
  const method = rpc("user").hackRoute("getMyPage");
  return (
    <ComponentLoader
      Component={PageUser}
      method={method}
      args={{}}
    />
  );
}
