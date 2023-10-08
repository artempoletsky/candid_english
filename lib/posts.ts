import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkHTML from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'data/posts');

export type BlogPage = {
  id: string,
  html: string,
  date: Date,
  title: string,
  description: string,
};

const BlogPageDefaults: BlogPage = {
  id: '',
  html: '',
  date: new Date(),
  title: '',
  description: ''
}

export type BlogMeta = {
  id: string,
  date: Date,
  title: string,
};


export function getSortedPostsData(): Array<BlogMeta> {
  // Get file names under /posts
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData: Array<BlogMeta> = fileNames.map((fileName) => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, '');

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Combine the data with the id
    return {
      id,
      ...matterResult.data as { date: Date, title: string },
    };
  });
  // Sort posts by date
  return allPostsData.sort((a: BlogMeta, b: BlogMeta) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getAllPostIds(): Array<{ id: string }> {
  const fileNames = fs.readdirSync(postsDirectory);

  return fileNames.map((fileName) => (
    { id: fileName.replace(/\.md$/, '') }
  ));
}

export async function getPostData(id: string): Promise<BlogPage> {
  const fullPath = path.join(postsDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  const processedContent = await remark()
    .use(remarkHTML)
    .process(matterResult.content);
  const html = processedContent.toString();

  return {
    ...BlogPageDefaults,
    id,
    html,
    ...matterResult.data,
  };
}

