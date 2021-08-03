import { Header } from '../_app';
import { getPosts } from '../../posts';

const Posts = ({ posts }) => (<>
    <Header title={'words'} />

    <main className={'container'}>
        <ul className={'space-y-4'}>
            {posts.map((post) => (<>
                <li>
                    <h1 className={'prose'}>
                        <a href={process.env.__DHOW_ROUTE_PATH + '/' + post.slug}>{post.data.title}</a>
                        <small className={'text-sm ml-2'}>
                            <time datetime={post.data.date.toISOString()}>
                                {post.data.date.getFullYear()}-{post.data.date.getMonth() + 1}-{post.data.date.getDate()}
                            </time>
                        </small>
                    </h1>

                    <p className={'text-sm text-gray-700'}>
                        {post.data.description}
                    </p>

                    <p>
                        {post.slug}
                    </p>
                </li>
            </>))}
        </ul>
    </main>
</>);

export const getProps = async () => {
    return { posts: await getPosts() };
}

export default Posts;
