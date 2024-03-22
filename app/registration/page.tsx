
import PageRegistration from "./PageRegistration";
import { Metadata } from "next";
import Layout from "~/app/components/PageLayout";
import { SITE_NAME } from "~/globals";
export const metadata: Metadata = {
  title: "",
};
export const dynamic = "force-dynamic";

type Props = {};
export default async function (props: Props) {

  
  metadata.title = `Create a new ${SITE_NAME} account`;
  return (
    <Layout>
      <h1>{metadata.title as string}</h1>
      <PageRegistration  />
    </Layout>
  );
}
