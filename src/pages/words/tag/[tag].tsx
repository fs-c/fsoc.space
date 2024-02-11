import { PostList, Tag } from '../index';
import { Header } from '../../../components';
import { getListedPostsAndTags, getListedTags } from '../../../posts';

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
    const listedTags = await getListedTags();
    return listedTags.map(({ uriSafeTag }) => uriSafeTag);
}

export const getProps = async (uriSafeTag) => {
    const { listedPosts, listedTags } = await getListedPostsAndTags();

    const currentTag = listedTags.find((tag) => tag.uriSafeTag === uriSafeTag);
    if (!currentTag) {
        throw new Error(`invalid tag '${uriSafeTag}'`)
    }

    const filteredPosts = listedPosts.filter((post) => post.tags.find((postTag) => postTag.uriSafeTag === currentTag.uriSafeTag));

    return { posts: filteredPosts, tags: listedTags, currentTag, title: 'fsoc.space/words' };
};

export default FilteredPostList;
