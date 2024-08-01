import { User } from "app/globals";

type Props = {
  author: User;
  label?: boolean;
}
export default function ArticleAuthor({ author, label }: Props) {
  return (
    <div className="">
      {label && <p className="">Author: </p>}
      <p className="">{author.fullName} @{author.username}</p>
    </div>
  )
}