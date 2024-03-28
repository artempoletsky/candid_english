
import { userView } from "lib/language_levels";
import { FormEvent, ReactNode, useState } from "react";
import { TestSession } from "./api/route";
import { Button } from "@mantine/core";
import ExamTicket from "components/ExamTicket";
import LanguageLevel from "components/LanguageLevel";
import { getAPIMethod } from "@artempoletsky/easyrpc/client";
import type { FGetDiscussion, FGetTicketDiscussion } from "app/api/discussion/methods";
import { fetchCatch } from "@artempoletsky/easyrpc/react";
import { Commentary } from "app/globals";
import Discussion from "components/dicsussion/Discussion";
import Link from "next/link";

type TestResultProps = {
  testSession: TestSession;
  onTryAgain: () => void;
};
type Discussions = Record<number, {
  opened: boolean;
  comments: Commentary[];
}>;

const getDiscussion = getAPIMethod<FGetDiscussion>("/api/discussion/", "getDiscussion");
export default function TestResult({ testSession, onTryAgain }: TestResultProps) {

  const [discussions, setDiscussions] = useState<Discussions>({});

  const loadDiscussion = fetchCatch(getDiscussion)
    .before((discussionId: number) => ({
      discussionId
    }))
    .then((comments, { discussionId }) => {
      // console.log(comments);
      setDiscussions({
        ...discussions,
        [discussionId]: {
          comments,
          opened: true,
        }
      });
    });

  function closeDiscussion(discussionId: number) {
    return function () {
      const d = discussions[discussionId];
      setDiscussions({
        ...discussions,
        [discussionId]: {
          comments: d.comments,
          opened: false,
        }
      });
    }
  }
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onTryAgain();
  }
  const tickets: ReactNode[] = [];

  for (const ticket of testSession.answers) {
    const discussionId = ticket.question.discussionId;
    const discussionOpened = discussions[discussionId] && discussions[discussionId].opened;
    const { explanation } = ticket.question;
    tickets.push(<div key={ticket.question.word} className="mb-4">
      <ExamTicket userAnswers={ticket.userAnswers} ticket={ticket.question} />
      {explanation && <div className="mb-2 mt-1">
        <div className="font-semibold">Explanation:</div>
        <div dangerouslySetInnerHTML={{ __html: explanation }}></div>
      </div>}

      {discussionOpened
        ? <div className="">
          <a className="pseudo mr-3" onClick={closeDiscussion(discussionId)}>Close discussion</a>
          <Link href={"/ticket/" + discussionId}>Link to discussion</Link>
          <Discussion className="mt-3" comments={discussions[discussionId].comments} discussionId={discussionId} />
        </div>
        : <a className="pseudo" onClick={loadDiscussion.action(discussionId)}>Discussion</a>
      }
    </div>)
  }
  return (
    <div>
      <p className="mt-5">Your level is</p>
      <p className="mb-4"><LanguageLevel size="lg" level={testSession.currentLevel} /></p>
      <p className="mt-5">Your answers:</p>
      <div>{tickets}</div>
      <form onSubmit={onSubmit} method="POST" encType="multipart/form-data">
        <div className="mt-5 flex justify-center"><Button type="submit" className="btn">Take the test again</Button></div>
      </form>
    </div>
  );
}
