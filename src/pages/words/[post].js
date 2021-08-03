import { Header } from '../_app';
import { getPost, getPosts } from '../../posts';

const Post = ({ post }) => (<>
    <Header title={'words'} />

    <main className={'container prose'}>
        {post.content}
    </main>
</>);

export const getProps = async (slug) => {
    const post = await getPost(slug);

    if (!post) {
        throw new Error('Couldn\'t get post ' + slug);
    }

    return { post };
}

export const getPaths = async () => {
    return (await getPosts()).map((post) => post.slug);
}

export default Post;
