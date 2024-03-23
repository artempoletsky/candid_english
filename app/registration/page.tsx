
import PageRegistration from "./PageRegistration";
import { Metadata } from "next";
import Layout from "~/app/components/PageLayout";
import { SITE_NAME } from "~/globals";
import { getSession } from "../session/session";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
export const metadata: Metadata = {
  title: "",
};
export const dynamic = "force-dynamic";

type Props = {};
export default async function (props: Props) {

  const session = await getSession();
  if (session.user) {
    redirect("/user");
  }
  metadata.title = `Create a new ${SITE_NAME} account`;
  return (
    <Layout>
      <h1>{metadata.title as string}</h1>
      <PageRegistration />
    </Layout>
  );
}
