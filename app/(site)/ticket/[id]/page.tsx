
import PageExamTicket from "./PageExamTicket";
import { Metadata } from "next";
import { getTicketDiscussion } from "app/api/discussion/methods_discussion";
// import PageNotFound from "~/app/not-found";
import { notFound } from 'next/navigation'

import z from "zod";
import { getSession } from "app/session/session";

// import ComponentLoader from "@/ComponentLoader";

export const metadata: Metadata = {
  title: "",
};

type Props = {
  params: {
    id: string;
  }
};
export default async function Page({ params: { id } }: Props) {
  
  let discussion;
  try {
    discussion = await getTicketDiscussion({
      encryptedDiscussionId: id,
    });   
  } catch (error: any) {
    if (error.statusCode == 404) {
      return notFound();
    }
    throw error;
  }


  metadata.title = "Exam ticket disscussion " + discussion.ticket.word;
  // const session = await getSession();
  // const method = "ticket/api/?getPage" as unknown as FGetPage;
  return (
    <PageExamTicket {...discussion} />
  );
}
