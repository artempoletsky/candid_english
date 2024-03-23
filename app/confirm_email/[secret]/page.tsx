

import { Metadata } from "next";

import PageLayout from "@/PageLayout";
import ComponentLoader from "@/ComponentLoader";
import { confirmEmail } from "./methods";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Confirm yer email",
};

type Props = {
  params: {
    secret: string;
  }
};
export default async function ({ params: { secret } }: Props) {
  const result = await confirmEmail({ secret });

  return (
    <PageLayout>
      <h1>{result ? `Email ${result} has been successfully activated!` : "The code has been activated before or is invalid"}</h1>
      <Link href="/user">Go to my page</Link>
    </PageLayout>
  );
}
