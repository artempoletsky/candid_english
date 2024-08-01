
import Link from "next/link";
import { getAllIds, getArticle } from "../methods_blog";
import { Metadata } from "next"
import { SITE_NAME } from "app/globals";
import ArticleAuthor from "components/ArticleAuthor";
import DiscussionAJAX from "components/dicsussion/DiscussionAJAX";


export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getAllIds({})).map(id => ({ id }));
}

type Props = {
  params: { id: string }
}

export const metadata: Metadata = {};

export default async function Page({ params }: Props) {

  const { article, comments, author } = await getArticle({ slug: params.id });

  metadata.title = article.h1 + " " + SITE_NAME + " Blog about English language";
  metadata.description = article.description;
  metadata.authors = article.authorsSEO;
  metadata.keywords = article.tags;
  metadata.alternates = {
    canonical: article.canonical,
  };

  metadata.openGraph = {
    type: "article",
    title: metadata.title,
    description: metadata.description,
    locale: "en",
    publishedTime: article.createdAt.toJSON(),
    modifiedTime: article.updatedAt.toJSON(),
    authors: article.authorsSEO.map(a => a.name),
    tags: article.tags,
    siteName: SITE_NAME,
  }

  return (
    <div className="">
      <div className="prose">
        <h1>{article.h1}</h1>
        <article dangerouslySetInnerHTML={{ __html: article.html }}></article>
      </div>
      <ArticleAuthor author={author} label />
      <DiscussionAJAX discussionId={article.discussionId} />
      <Link href="/">Back to the main page</Link>
    </div>
  );
};


