import path from 'path';
import smdp from '@fsoc/smdp';
import parseFrontMatter from 'gray-matter';
import { readFile, readdir } from 'fs/promises';

const contentDirectory = 'posts';

const cache = { posts: [], indices: [] };

const getIsoDate = (date) => date.toISOString();
const getHumanDate = (date) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

export const getContent = async () => {
    const files = (await readdir(contentDirectory))
        .map((p) => path.join(contentDirectory, p));

    const posts = [];
    const indices = {};

    // First pass: Sort files into posts and indices
    for (const filePath of files) {
        const slug = path.parse(filePath).name;

        const fileContent = await readFile(filePath);
        const frontMatter = parseFrontMatter(fileContent);

        const content = smdp.parse(frontMatter.content);

        if (frontMatter.data.index) {
            indices[frontMatter.data.index] = {
                slug,
                content,
                ...frontMatter.data,
                posts: []
            };
        } else {
            const isoDate = getIsoDate(frontMatter.data.date);
            const humanDate = getHumanDate(frontMatter.data.date);

            posts.push({
                path: filePath,
                slug,
                content,
                ...frontMatter.data,
                isoDate, humanDate,
                filePath,
            });
        }
    }

    posts.sort((a, b) => b.date - a.date);

    // Second pass: Populate indices with posts based on tag
    for (const post of posts) {
        if (!post.tags || !post.tags.length) {
            continue;
        }

        for (const tag of post.tags) {
            if (indices[tag]) {
                indices[tag].posts.push(post);
            }
        }
    }

    cache.posts = posts;
    cache.indices = Object.values(indices);

    return cache;
};

export const getPost = async (slug) => {
    for (const post of cache.posts) {
        if (post.slug === slug) {
            return post;
        }
    }

    return (await getContent()).posts.filter((post) => post.slug === slug)[0];
};

export const getIndex = async (slug) => {
    for (const index of cache.indices) {
        if (index.slug === slug) {
            return index;
        }
    }

    return (await getContent()).indices.filter((index) => index.slug === slug)[0];
}
