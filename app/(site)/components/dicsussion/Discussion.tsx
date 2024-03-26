"use client";
import { Comment } from "app/globals";
import CompComment from "./CompComment";
import FormPostComment from "./FormPostComment";
import { useState } from "react";

type Props = {
  comments: Comment[];
  discussionId: number;
}
export default function Discussion({ comments: commentsInitial, discussionId }: Props) {
  const [comments, setComments] = useState(commentsInitial);
  function addComment(comment: Comment) {
    setComments([...comments, comment]);
  }
  return <div className="">
    <div className="mb-6">
      {!comments.length && <div>No comments yet</div>}
      {comments.map(item => <CompComment key={item.id} {...item} />)}
    </div>
    <FormPostComment discussionId={discussionId} onPost={addComment} />
  </div>
}