import { Header } from '../_app';
import { getContent } from '../../posts';

const Post = ({ slug, title, isoDate, humanDate, description, external }) => (<>
    <li><a href={external ? external : process.env.__DHOW_ROUTE_PATH + '/' + slug}>
        <h1>
            <span className={'font-medium dark:text-gray-100 inline-flex flex-row items-center gap-2'}>
                {external && <span class="px-2 p-[2px] text-xs dark:bg-gray-700 rounded-md h-min">EXTERNAL</span>}
                
                {title}
            </span>
            
            <small className={'text-gray-500 dark:text-gray-400 ml-2'}>
                <time datetime={isoDate}>
                    {humanDate}
                </time>
            </small>
        </h1>

        <p className={'text-gray-700 dark:text-gray-300 font-light'}>
            {description}
        </p>
    </a></li>
</>);

const IndexPost = ({ slug, title, posts }) => (<>
    <Post slug={slug} title={title}
        description={`Containing ${posts.length} posts, newest from ${posts[0].humanDate}.`}
    />
</>);

const Posts = ({ posts, pinnedPosts, indices }) => (<>
    <Header title={'words'} />

    <main className={'container my-4 flex flex-col gap-4'}>
        <div className={'pb-4'}>
            <h2 className={'mb-2 dark:text-gray-400 text-gray-500 uppercase tracking-widest text-sm font-bold'}>
                Pinned
            </h2>

            <ul className={'flex flex-col space-y-4'}>
                {indices.map((index) => <>
                    <IndexPost {...index} />
                </>)}

                {pinnedPosts.map((post) => (<>
                    <Post {...post} />
                </>))}
            </ul>
        </div>

        <div>
            <h2 className={'mb-2 dark:text-gray-400 text-gray-500 uppercase tracking-widest text-sm font-bold'}>
                All Posts ({posts.length})
            </h2>

            <ul className={'flex flex-col space-y-4'}>
                {posts.map((post) => (<>
                    <Post {...post} />
                </>))}
            </ul>
        </div>
    </main>
</>);

export const getProps = async () => {
    const content = await getContent();
    const posts = content.posts.filter((p) => p.listed !== false && !p.pinned);
    const pinnedPosts = content.posts.filter((p) => p.pinned === true);
    const indices = content.indices;

    return { posts, pinnedPosts, indices, title: 'fsoc.space/words' };
}

export default Posts;
