import { Header } from '../_app';
import { Head } from '@fsoc/dhow';
import { getPost, getPosts } from '../../posts';

const githubUrl = 'https://github.com/fs-c/fsoc.space/';

const Post = ({ title, description, content, humanDate, filePath }) => (<>
    <Head>
        <meta name={'description'} content={description} />

        <link href="https://unpkg.com/prismjs@v1.x/themes/prism.css" rel="stylesheet" />
    </Head>

    <Header title={'words'} href={'/words'} />

    <main className={'container prose'}>
        <h1>
            {title}
        </h1>

        <aside className={'mb-2 flex flex-row justify-between'}>
            <small>Last edited on {humanDate}</small>
            <small><a href={githubUrl + 'edit/workbench/' + filePath}>Edit on github</a></small>
        </aside>

        {content}

        <script src="https://unpkg.com/prismjs@v1.x/components/prism-core.min.js"></script>
	    <script src="https://unpkg.com/prismjs@v1.x/plugins/autoloader/prism-autoloader.min.js"></script>
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
