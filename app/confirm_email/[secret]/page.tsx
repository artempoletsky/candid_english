

import { Metadata } from "next";

import PageLayout from "@/PageLayout";

import Link from "next/link";
import { confirmEmail } from "~/app/api/user/methods";

export const metadata: Metadata = {
  title: "Confirm your email",
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
