import Link from "next/link";
import { Commentary } from "app/globals";
import LanguageLevel from "../LanguageLevel";

function author(author: string, guest: boolean) {
  if (!author) return "Anonymous";
  if (!guest) return author;
  return <Link href={`user/${author}`}>{author}</Link>;
}
export default function CompComment(comment: Commentary) {
  const date = new Date(comment.date);
  const guest = !!comment.flags[0];
  const admin = !!comment.flags[1];
  const mod = !!comment.flags[2] && !admin;

  return <div className="border border-gray-400 rounded px-3 py-1 mb-3 bg-stone-200">
    <div className="mb-1">
      {author(comment.author, guest)}&nbsp;
      {mod && <span className="">mod</span>}
      {admin && <span className="">admin</span>}
      <LanguageLevel level={comment.authorLvl} />
      &nbsp;{date.toJSON()}
      <a className="pseudo ml-2">#{comment.id}</a>
    </div>
    <div className="break-words">{comment.text}</div>
  </div>
}