
import { BlogPage, getAllPostIds, getPostData } from 'lib/posts';
import Link from 'next/link';


export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllPostIds();
}

type Props = {
  params: { id: string }
}

import { Metadata } from 'next'
export const metadata: Metadata = {
  title: '',
  description: '',
};

export default async function BlogArticle({ params }: Props) {

  const postData: BlogPage = await getPostData(params.id);
  metadata.title = postData.title;
  metadata.description = postData.description;
  return (
    <>
      <h1>{postData.title}</h1>
      <article dangerouslySetInnerHTML={{ __html: postData.html }}></article>
      <Link href="/">Back to the main page</Link>
    </>
  );
};


