import { methodFactory, query } from "app/db";
import { AGetAllIds, AGetArticle, AGetBlogPage } from "./schemas";
import { User } from "app/globals";


export const getAllIds = methodFactory(({ articles }, { }, { $ }) => {
  return articles.all().select($.primary);
});


export const getArticle = methodFactory(({ articles, users }, { slug }: AGetArticle, { $, drill }) => {
  const article = articles.at(slug, $.full);
  return {
    article,
    author: users.at(article.authorId),
    comments: drill.getComments(article.discussionId),
  }
});


export const getBlogPage = methodFactory(({ articles, users }, { page }: AGetBlogPage, { $, drill }) => {
  const pageArticles = articles.all().paginate(page, 10).select();
  const authorIds = pageArticles.map(a => a.authorId);
  // console.log(pageArticles);

  // const authors = users.where("id", ...authorIds).select();
  const authors: Record<number, User> = $.dictFromKeys(authorIds as any, key => users.at(key as any));
  return {
    articles: pageArticles,
    authors,
  }
});
