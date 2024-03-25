import z from "zod";


const zCommentText = z.string().min(1).max(255);
export const postComment = z.object({
  discussionId: z.number(),
  text: zCommentText,
  guestName: z.string().optional(),
});
export type APostComment = z.infer<typeof postComment>;

const getDiscussion = z.object({
  discussionId: z.number(),
});
export type AGetDiscussion = z.infer<typeof getDiscussion>;

export const getTicketDiscussion = getDiscussion;