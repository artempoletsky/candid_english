"use client";
import { Commentary } from "app/globals";
import CompComment from "./CompComment";
import FormPostComment from "./FormPostComment";
import { useEffect, useRef, useState } from "react";
import { postLinkOver, postLinkOut, scrollToComment, replyClick } from "./discussionEvents";

type Props = {
  comments: Commentary[];
  discussionId: number;
  className?: string;
}
export default function Discussion({ comments: commentsInitial, discussionId, className }: Props) {
  const [comments, setComments] = useState(commentsInitial);
  const refSelf = useRef<HTMLDivElement>(null);

  const [commentToScroll, setCommentToScroll] = useState(0);

  useEffect(() => {
    if (commentToScroll) {
      scrollToComment(commentToScroll);
    }
  }, [commentToScroll]);

  function addComment(comment: Commentary) {
    setComments([...comments, comment]);
    setCommentToScroll(comment.id);
  }

  function onPostLinkOver(e: MouseEvent) {
    const t = e.target as HTMLElement;
    if (t.classList.contains("pl")) {
      postLinkOver(refSelf.current!, t as HTMLSpanElement);
    }
  }

  function onPostLinkOut(e: MouseEvent) {
    const t = e.target as HTMLElement;
    if (t.classList.contains("pl")) {
      postLinkOut(refSelf.current!, t as HTMLSpanElement);
    }
  }

  function onPostLinkClick(e: MouseEvent) {
    const t = e.target as HTMLElement;
    if (t.classList.contains("pl")) {
      const commentId = parseInt(t.dataset["comment"]!);
      scrollToComment(commentId);
    } else if (t.classList.contains("pl_op")) {
      scrollToComment(0);
    }
  }

  useEffect(() => {
    const self = refSelf.current!;
    self.addEventListener("mouseover", onPostLinkOver);
    self.addEventListener("mouseout", onPostLinkOut);
    self.addEventListener("click", onPostLinkClick);
    return function () {
      self.removeEventListener("mouseover", onPostLinkOver);
      self.removeEventListener("mouseout", onPostLinkOut);
      self.removeEventListener("click", onPostLinkClick);
    }
  }, []);

  return <div ref={refSelf} className={className + " mt-3"}>
    <div id="CommentsContainer" className="mb-6">
      {!comments.length && <div>No comments yet</div>}
      {comments.map(item => <CompComment key={item.id} {...item} />)}
    </div>
    <FormPostComment discussionId={discussionId} onPost={addComment} />
  </div>
}