import path from 'path';
import smdp from '@fsoc/smdp';
import parseFrontMatter from 'gray-matter';
import { readFile, readdir } from 'fs/promises';

const contentDirectory = 'posts';

export interface Post {
    slug: string;
    content: string;
    title: string;
    description: string;
    tags: Tag[],
    date: number,
    formattedDate: string;
    filePath: string;
    externalLink?: string;
    listed: boolean;
}

interface Tag {
    formattedTag: string;
    uriSafeTag: string;
}

interface InternalCache {
    set: boolean;
    value: {
        posts: Post[],
        listedPosts: Post[],
        listedTags: Tag[]
    }
}

const cache: InternalCache = { set: false, value: { posts: [], listedPosts: [], listedTags: [] } };

const formatDate = (date: Date) => date.toLocaleString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
});

const getTagObjectFromString = (tagString: string): Tag => ({
    formattedTag: tagString.toUpperCase(),
    uriSafeTag: tagString.toLowerCase().replace(/[^a-zA-Z0-9-_]/g, '')
});

export const getPostsAndTags = async () => {
    if (cache.set) {
        return cache.value;
    }

    const files = (await readdir(contentDirectory))
        .map((p) => path.join(contentDirectory, p));

    const posts = [];

    for (const filePath of files) {
        const slug = path.parse(filePath).name;

        const fileContent = await readFile(filePath);
        const { data: metadata, content: rawContent } = parseFrontMatter(fileContent);

        const content = smdp.parse(rawContent);
        const formattedDate = formatDate(metadata.date);

        const postTagStrings = metadata.tags ?? [];
        if (metadata.external) {
            postTagStrings.push('external');
        }

        const postTags = postTagStrings.map(getTagObjectFromString);
        posts.push({
            slug,
            content,
            title: metadata.title,
            description: metadata.description,
            tags: Array.from(postTags.values()),
            date: metadata.date,
            formattedDate,
            filePath,
            externalLink: metadata.external,
            listed: metadata.listed !== false
        });
    }

    cache.value.posts = posts.sort((a, b) => b.date - a.date);
    cache.value.listedPosts = cache.value.posts.filter((post) => post.listed);

    // map visible posts to [ safeTagName, tagObject ] and pass that to Map, to deduplicate
    // by tag url component
    cache.value.listedTags = Array.from((new Map(cache.value.listedPosts.flatMap((post) => (
        post.tags.map((tag) => [ tag.uriSafeTag, tag ])
    )))).values())

    cache.set = true;

    return cache.value;
};

export const getPost = async (slug) => {
    return (await getPostsAndTags()).posts.find((post) => post.slug === slug);
};
