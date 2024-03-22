
import PageUser from "./PageUser";
import { Metadata } from "next";
import { FGetPage } from "./api/methods";
import PageLayout from "@/PageLayout";
import ComponentLoader from "@/ComponentLoader";

export const metadata: Metadata = {
  title: "",
};

type Props = {};
export default async function (props: Props) {
  const method = "user/api/?getPage" as unknown as FGetPage;
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
