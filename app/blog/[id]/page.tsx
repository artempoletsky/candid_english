
import { BlogPage, getAllPostIds, getPostData } from '~/lib/posts';
import Link from 'next/link';
import Layout from '@/layout';

export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllPostIds();
}

import { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Blog',
  description: 'A blog about English language.',
};


export default async function BlogArticle({ params }: { params: any }) {

  const postData: BlogPage = await getPostData(params.id);
  metadata.title = postData.title;
  // const allPostsData = getSortedPostsData();
  return (
    <Layout>
      <h1>{postData.title}</h1>
      <article dangerouslySetInnerHTML={{ __html: postData.html }}></article>
      <Link href="/">Back to the main page</Link>
    </Layout>
  );

};


