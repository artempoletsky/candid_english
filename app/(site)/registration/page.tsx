
import PageRegistration from "./PageRegistration";
import { Metadata } from "next";

import { SITE_NAME } from "app/globals";
import { getSession } from "../../session/session";
import { redirect } from "next/navigation";
export const metadata: Metadata = {
  title: "",
};
export const dynamic = "force-dynamic";

type Props = {};
export default async function Page(props: Props) {

  const session = await getSession();
  if (session.user) {
    redirect("/user");
  }
  metadata.title = `Create a new ${SITE_NAME} account`;
  return (
    <>
      <h1>{metadata.title as string}</h1>
      <PageRegistration />
    </>
  );
}
