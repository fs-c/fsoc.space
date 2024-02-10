import { PostList, Tag } from '../index';
import { Header } from '../../../components';
import { getPostsAndTags } from '../../../posts';

const FilteredPostList = ({ posts, tags, currentTag }) => (<>
    <Header elements={[{ title: 'words', href: '/words' }, { title: currentTag.formattedTag.toLowerCase() }]} />

    <p className={'container text-gray-600 dark:text-gray-400 flex flex-row gap-2'}>
        <span className={'mr-1'}>Filter by tag</span> {tags.map((tag) => (
            <Tag tag={tag} link active={currentTag.uriSafeTag === tag.uriSafeTag} />
        ))}
    </p>

    <PostList posts={posts} />
</>);

export const getPaths = async () => {
    return (await getPostsAndTags()).listedTags.map(({ uriSafeTag }) => uriSafeTag);
}

export const getProps = async (uriSafeTag) => {
    const { posts, listedTags: tags } = await getPostsAndTags();
    const tag = tags.find((tag) => tag.uriSafeTag === uriSafeTag);

    if (!tag) {
        throw new Error(`invalid tag '${uriSafeTag}'`)
    }

    const filteredPosts = posts.filter((post) => post.tags.find((postTag) => postTag.uriSafeTag === tag.uriSafeTag));

    return { posts: filteredPosts, tags, currentTag: tag, title: 'fsoc.space/words' };
};

export default FilteredPostList;
