import { ExamTicketLight } from "site/test/api/route";
import Select from "components/select";
import { TestQuestion } from "kdbUser/validation";
import LanguageLevel from "./LanguageLevel";
import React, { HTMLAttributes, ReactNode } from "react";
import Image from "next/image";

interface TestSentenceProps extends HTMLAttributes<HTMLDivElement> {
  ticket: TestQuestion | ExamTicketLight;
  userAnswers?: string[];
  className?: string;
};

function answer(text: string, correct: boolean) {
  return <strong className={correct ? "bg-green-300" : "bg-red-300"}>{text}</strong>;
}
const TEMPLATE = "{...}";
export default function ExamTicket({ ticket, userAnswers, className }: TestSentenceProps) {
  const chunks = ticket.template.split(TEMPLATE);
  let result: ReactNode[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const options = ticket.options[i];
    result.push(<span key={`chunk_${i}`} dangerouslySetInnerHTML={{ __html: chunk }}></span>);
    if (!options) break;
    if ("correctAnswers" in ticket) {
      const correctId = ticket.correctAnswers[i];
      const correct = options[correctId];
      if (userAnswers === undefined) {
        result.push(<span key={i}>{correct}</span>);
      } else {
        const userAnswer = userAnswers[i] || "no answer";
        if (correct != userAnswer) {
          result.push(<span key={i}>{answer(userAnswer, false)} {answer(correct, true)}</span>);
        } else {
          result.push(<span key={i}>{answer(correct, true)}</span>);
        }
      }

    } else {
      result.push(<Select key={i} className="select" name={i.toString()} placeholder="Select..." array={options} />)
    }
  }

  return <div className={className}>
    {ticket.image && <Image src={ticket.image} alt="image" width={400} height={400} />}
    {"difficulty" in ticket && <LanguageLevel level={ticket.difficulty} />}
    {result}
  </div>;
}
