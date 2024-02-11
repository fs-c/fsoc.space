import { Header } from '../../components';
import { getListedPostsAndTags } from '../../posts';

const getPostHref = (post) => post.externalLink || `/words/${post.slug}`;
const getTagHref = (tag) => `/words/tag/${tag.uriSafeTag}`;

const Pill = ({ children, active = false, hoverEffect = false }) => (<>
    <span className={`px-2 py-[2px] text-xs rounded-md h-min font-medium align-middle ${hoverEffect ? 'hover:bg-gray-700 hover:text-gray-200 dark:hover:bg-gray-300 dark:hover:text-gray-900' : ''} ${active ? 'bg-gray-700 text-gray-200 dark:bg-gray-300 dark:text-gray-900': 'bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-200'}`}>{children}</span>
</>);

export const Tag = ({ tag, link = false, active = false }) => (<>
    {link ? (
        <a href={active ? '/words' : getTagHref(tag)}><Pill active={active} hoverEffect={link}>{tag.formattedTag}</Pill></a>
    ) : (
        <Pill>{tag.formattedTag}</Pill>
    )}
</>);

const PostEntry = (post) => {
    const { formattedDate, title, description, tags } = post;

    return (<>
        <div className={'flex flex-col justify-stretch md:flex-row'}>
            <div className={'md:basis-0 md:min-w-max md:flex-grow md:flex md:flex-row md:justify-end'}>
                <small className={'text-gray-500 dark:text-gray-400 font-mono pl-4'}>
                    <time dateTime={formattedDate}>
                        {formattedDate}
                    </time>
                </small>
            </div>

            <a href={getPostHref(post)} className={'flex flex-col px-4 md:max-w-3xl md:w-full'}>
                <h1 className={'font-medium dark:text-gray-100'}>                
                    {title}

                    {tags.map((tag) => <span className={'ml-2'}><Tag tag={tag} /></span>)}
                </h1>

                <p className={'text-gray-700 dark:text-gray-300 font-light'}>
                    {description}
                </p>
            </a>

            <div className={'hidden md:block md:basis-0 md:flex-grow'}></div>
        </div>
    </>);
};

export const PostList = ({ posts }) => (<>
    <div className={'my-4 flex flex-col gap-6 max-w-3xl w-full mx-auto md:max-w-full'}>
        {posts.map((post) => <PostEntry {...post} />)}
    </div>
</>);

const Posts = ({ posts, tags }) => (<>
    <Header elements={[{ title: 'words' }]} />

    <p className={'container text-gray-600 dark:text-gray-400 flex flex-row gap-2'}>
        <span className={'mr-1'}>Filter by tag</span> {tags.map((tag) => <Tag tag={tag} link />)}
    </p>

    <PostList posts={posts} />
</>);

export const getProps = async () => {
    const { listedPosts, listedTags } = await getListedPostsAndTags();
    return { posts: listedPosts, tags: listedTags, title: 'fsoc.space/words' };
}

export default Posts;
