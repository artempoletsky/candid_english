import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'A blog about English language.',
};

export default function BlogMain() {
  return(
      <div className="">
        <h1 className="foo">Welcome</h1>
        <Link href="/">Back to the main page</Link>
      </div>
  );
};
