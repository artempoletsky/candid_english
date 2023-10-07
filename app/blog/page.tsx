import { Metadata } from 'next';
import Link from 'next/link';
import styles from './custom.module.css';
import { getSortedPostsData } from '~/lib/posts';
import Layout from '@/layout';


export const metadata: Metadata = {
  title: 'Blog',
  description: 'A blog about English language.',
};


export default async function BlogMain() {
  const allPostsData = getSortedPostsData();
  return (
    <Layout>
      <h1 className="foo">Welcome</h1>
      <Link href="/">Back to the main page</Link>
      <section>
        <h2>Blog</h2>
        <h3>H3</h3>
        <button>test</button>
        <ul>
          {allPostsData.map(({ id, date, title }) => (
            <li key={id}>
              <Link href={`/blog/${id}`}>{title}</Link>
              <small className={styles.date}>{date.toString()}</small>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  );

};

