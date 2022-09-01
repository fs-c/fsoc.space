import { Header } from '../_app';
import { getPosts } from '../../posts';

const Posts = ({ posts }) => (<>
    <Header title={'words'} />

    <main className={'container'}>
        <ul className={'space-y-4'}>
            {posts.map((post) => (<>
                <li>
                    <h1>
                        <a className={'text-lg font-semibold'} href={process.env.__DHOW_ROUTE_PATH + '/' + post.slug}>{post.title}</a>
                        <small className={'text-sm ml-2'}>
                            <time datetime={post.isoDate}>
                                {post.humanDate}
                            </time>
                        </small>
                    </h1>

                    <p className={'text-sm text-gray-700'}>
                        {post.description}
                    </p>
                </li>
            </>))}
        </ul>
    </main>
</>);

export const getProps = async () => {
    return { posts: (await getPosts()).filter((p) => p.listed !== false), title: 'fsoc.space/words' };
}

export default Posts;
