import path from 'path';
import marked from 'marked';
import parseFrontMatter from 'gray-matter';
import { readFile, readdir } from 'fs/promises';

import hljs from 'highlight.js';

const contentDirectory = 'posts';

marked.setOptions({
    renderer: new marked.Renderer(),
    highlight: (code, lang) => {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
    },
});

export const getPosts = async () => {
    const files = (await readdir(contentDirectory))
        .map((p) => path.join(contentDirectory, p));
    const posts = [];

    for (const filePath of files) {
        const fileContent = await readFile(filePath);
        const frontMatter = parseFrontMatter(fileContent);

        frontMatter.content = marked(frontMatter.content);

        posts.push({
            path: filePath,
            slug: path.parse(filePath).name,
            ...frontMatter,
        });
    }

    return posts;
};

export const getPost = async (slug) => {
    return (await getPosts()).filter((post) => post.slug === slug)[0];
};
