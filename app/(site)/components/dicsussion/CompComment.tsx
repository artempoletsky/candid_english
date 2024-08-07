import Link from "next/link";
import { Commentary } from "app/globals";
import LanguageLevel from "../LanguageLevel";
import { formWrapper } from "./FormPostComment";
import { useRef } from "react";
import { replyClick } from "./discussionEvents";
import CommentModBlock from "./CommentModBlock";


function author(author: string, guest: boolean) {
  if (!author) return "Anonymous";
  return <span className="text-orange-600">{author}</span>;
  // if (!guest) return author;
  // return <Link href={`/user/${author}`}>{author}</Link>;
}
export default function CompComment(comment: Commentary) {
  const date = new Date(comment.date);
  const guest = !!comment.flags[0];
  const admin = !!comment.flags[1];
  const mod = !!comment.flags[2] && !admin;
  const refSelf = useRef<HTMLDivElement>(null);


  const addPostLink = () => {
    replyClick(comment.id);
  }

  return <div
    id={`comment${comment.id}`}
    ref={refSelf}
    className="comp_comment"
  >
    <div className="mb-1">
      {author(comment.author, guest)}&nbsp;
      {mod && <span className="">mod</span>}
      {admin && <span className="">admin</span>}
      <LanguageLevel level={comment.authorLvl} />
      &nbsp;{date.toJSON()}
      <span className="pseudo mx-2" onClick={addPostLink}>№{comment.id}</span>
      <CommentModBlock {...comment} />
    </div>
    <div dangerouslySetInnerHTML={{ __html: comment.html }}></div>
  </div>
}