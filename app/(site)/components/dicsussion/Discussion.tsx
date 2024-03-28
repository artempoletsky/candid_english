"use client";
import { Commentary } from "app/globals";
import CompComment from "./CompComment";
import FormPostComment from "./FormPostComment";
import { useState } from "react";

type Props = {
  comments: Commentary[];
  discussionId: number;
  className?: string;
}
export default function Discussion({ comments: commentsInitial, discussionId, className }: Props) {
  const [comments, setComments] = useState(commentsInitial);
  function addComment(comment: Commentary) {
    setComments([...comments, comment]);
  }
  return <div className={className}>
    <div className="mb-6">
      {!comments.length && <div>No comments yet</div>}
      {comments.map(item => <CompComment key={item.id} {...item} />)}
    </div>
    <FormPostComment discussionId={discussionId} onPost={addComment} />
  </div>
}