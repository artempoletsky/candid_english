import { Metadata } from 'next';
import Link from 'next/link';
import styles from './custom.module.css';
import { getBlogPage } from './methods_blog';
import ArticleAuthor from 'components/ArticleAuthor';


export const metadata: Metadata = {
  title: 'Blog',
  description: 'A blog about English language.',
};


export default async function Page() {
  const { articles, authors } = await getBlogPage({ page: 1 });
  return (
    <section>
      <ul>
        {articles.map(({ slug, createdAt, h1, authorId }) => (
          <li key={slug}>
            <Link href={`/blog/${slug}`}>{h1}</Link>
            <small className={styles.date}>{createdAt.toString()}</small>
            <ArticleAuthor author={authors[authorId]} />
          </li>
        ))}
      </ul>
    </section>
  )
}

