import path from 'path';
import { Header } from '../_app';
import { Head } from '@fsoc/dhow';
import { getPost, getPosts } from '../../posts';

const githubUrl = 'https://github.com/fs-c/fsoc.space/';

const Post = ({ title, description, content, slug, humanDate, filePath }) => (<>
    <Head>
        <meta name={'description'} content={description} />
    </Head>

    <Header titles={[
        { content: 'words', href: path.resolve(process.env.__DHOW_ROUTE_PATH, '..') },
        slug
    ]} />

    <main className={'container prose'}>
        <aside className={'flex flex-row justify-between'}>
            <small>Last edited on {humanDate}</small>

            <small><a href={githubUrl + 'edit/workbench/' + filePath}>Edit on github</a></small>
        </aside>

        <h1>
            {title}
        </h1>

        {content}
    </main>
</>);

export const getProps = async (slug) => {
    const post = await getPost(slug);

    if (!post) {
        throw new Error('Couldn\'t get post ' + slug);
    }

    return post;
}

export const getPaths = async () => {
    return (await getPosts()).map((post) => post.slug);
}

export default Post;
