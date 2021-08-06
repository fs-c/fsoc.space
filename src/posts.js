import path from 'path';
import smdp from '@fsoc/smdp';
import parseFrontMatter from 'gray-matter';
import { readFile, readdir } from 'fs/promises';

const contentDirectory = 'posts';

const cache = { posts: [] };

const getIsoDate = (date) => date.toISOString();
const getHumanDate = (date) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

export const getPosts = async () => {
    const files = (await readdir(contentDirectory))
        .map((p) => path.join(contentDirectory, p));
    const posts = [];

    for (const filePath of files) {
        const fileContent = await readFile(filePath);
        const frontMatter = parseFrontMatter(fileContent);

        const content = smdp.parse(frontMatter.content);

        const isoDate = getIsoDate(frontMatter.data.date);
        const humanDate = getHumanDate(frontMatter.data.date);

        posts.push({
            path: filePath,
            slug: path.parse(filePath).name,
            content,
            ...frontMatter.data,
            isoDate, humanDate,
            filePath,
        });
    }

    posts.sort((a, b) => b.date - a.date);

    cache.posts = posts;

    return posts;
};

export const getPost = async (slug) => {
    for (const post of cache.posts) {
        if (post.slug === slug) {
            return post;
        }
    }

    return (await getPosts()).filter((post) => post.slug === slug)[0];
};
