import { Commentary } from "app/globals";
import { adminRPCCustom } from "app/kurgandb/globals";
import { useStore, Store } from "app/store";
import { removeComment } from "./discussionEvents";

const remove = adminRPCCustom().method("removeComment")
export default function CommentModBlock({ flags, id }: Commentary) {
  const [user] = useStore("user");
  if (!user || !user.isAdmin) return "";

  const onRemoveClick = () => {
    remove({
      commentId: id,
    }).then(() => {
      removeComment(id);
    });
  }
  return <span className="pseudo" onClick={onRemoveClick}>Remove</span>
}