import { zArticleSlug } from "app/globals";
import { z } from "zod";


export const ZGetAllIds = z.object({});

export type AGetAllIds = z.infer<typeof ZGetAllIds>;


export const ZGetBlogPage = z.object({
    page: z.number().int(),
});

export type AGetBlogPage = z.infer<typeof ZGetBlogPage>;


export const ZGetArticle = z.object({
    slug: zArticleSlug,
});

export type AGetArticle = z.infer<typeof ZGetArticle>;