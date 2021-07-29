import path from 'path';
import marked from 'marked';
import parseFrontMatter from 'gray-matter';
import { readFile, readdir } from 'fs/promises';

const contentDirectory = 'posts'

const Post = ({ post }) => (
    <p>
        {post}
    </p>
);

export const getPaths = async () => {
    const parsedFilePaths = (await readdir(contentDirectory))
        .map((p) => path.parse(p));

    return parsedFilePaths.map((p) => path.join(p.dir, p.name));
}

export const getProps = async (slug) => {
    const parsedPost = parseFrontMatter(
        await readFile(path.join(contentDirectory, `${slug}.md`), 'utf-8')
    );

    parsedPost.content = marked(parsedPost.content);

    return post;
}

export default Post
