import { Header } from '../_app';
import { getPosts } from '../../posts';

const Posts = ({ posts }) => (<>
    <Header title={'words'} />

    <main className={'container'}>
        <ul className={'space-y-4'}>
            {posts.map((post) => (<>
                <li><a href={process.env.__DHOW_ROUTE_PATH + '/' + post.slug}>
                    <h1>
                        <span className={'font-medium'}>{post.title}</span>
                        
                        <small className={'text-gray-500 ml-2'}>
                            <time datetime={post.isoDate}>
                                {post.humanDate}
                            </time>
                        </small>
                    </h1>

                    <p className={'text-gray-700 font-light'}>
                        {post.description}
                    </p>
                </a></li>
            </>))}
        </ul>
    </main>
</>);

export const getProps = async () => {
    return { posts: (await getPosts()).filter((p) => p.listed !== false), title: 'fsoc.space/words' };
}

export default Posts;
