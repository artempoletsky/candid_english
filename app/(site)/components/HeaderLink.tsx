import Link from "next/link";
import { ReactNode } from "react";

type Props = {
  href: string;
  children?: ReactNode | ReactNode[];
}
export default function HeaderLink({ href, children }: Props) {
  return (<Link className="block py-3 px-3 whitespace-nowrap" href={href}>{children}</Link>)
}
