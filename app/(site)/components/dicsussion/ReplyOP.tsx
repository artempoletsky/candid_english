import { replyClick } from "./discussionEvents";


export default function ReplyOP() {
  return <div className="my-3">
    <span className="pseudo" onClick={e => replyClick(0)}>Reply</span>
  </div>
}