import { ReactNode } from "react";


type Props = {
  meta: any;
}
export default function TableMeta({ meta }: Props) {

  function recur(object: any, level = 0): ReactNode {
    const items: ReactNode[] = [];

    for (const key in object) {
      const item = object[key];
      const type = typeof item;
      let content: ReactNode = "";
      if (item instanceof Array) {
        content = <div>{`Array(${item.length})`}</div>
      } else if (type == "object") {
        content = recur(item, level + 1);
      } else {
        content = <div>{`${key} (${type}): ${item}`}</div>
      }

      items.push(<div key={key}>{content}</div>)
    }
    return <div>{items}</div>
  }
  const keysL = Object.keys(meta).length;
  if (!keysL) {
    return <div className="mb-3">Table metadata is empty</div>;
  }
  return (<div className="mb-3">
    <p className="">Table metadata:</p>
    {recur(meta)}
  </div>)
}