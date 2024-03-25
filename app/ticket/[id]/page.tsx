
import PageExamTicket from "./PageExamTicket";
import { Metadata } from "next";
import PageLayout from "@/PageLayout";
import { getTicketDiscussion } from "~/app/api/discussion/methods";
// import PageNotFound from "~/app/not-found";
import { notFound } from 'next/navigation'

import z from "zod";
// import ComponentLoader from "@/ComponentLoader";

export const metadata: Metadata = {
  title: "",
};

type Props = {
  params: {
    id: number;
  }
};
export default async function ({ params: { id } }: Props) {
  // console.log(typeof id);

  try {
    id = z.coerce.number().parse(id);
  } catch (error) {
    return notFound();
  }
  
  let discussion;
  try {
    discussion = await getTicketDiscussion({
      discussionId: id,
    });
  } catch (error: any) {
    if (error.statusCode == 404) {
      return notFound();
    }
    throw error;
  }


  metadata.title = "Exam ticket disscussion " + discussion.ticket.word;
  // const method = "ticket/api/?getPage" as unknown as FGetPage;
  return (
    <PageLayout>
      <h1>{metadata.title as string}</h1>
      <PageExamTicket {...discussion} />
    </PageLayout>
  );
}
