import { Header } from '../../components/';
import { Head } from '@fsoc/dhow';
import { getPost, getPostsAndTags } from '../../posts';

const githubUrl = 'https://github.com/fs-c/fsoc.space/';

const Post = ({ title, description, content, formattedDate, filePath }) => (<>
    <Head>
        <meta name={'description'} content={description} />

        <link href="/styles/syntax-theme.css" rel="stylesheet" />
    </Head>

    <Header elements={[{ title: 'words', href: '/words' }]} />

    <main className={'container prose dark:prose-invert lg:prose-lg pb-8'}>
        <h1 className={'mt-4'}>
            {title}
        </h1>

        <aside className={'mb-4 flex flex-row justify-between'}>
            <small>
                Published on {formattedDate}
            </small>

            <small>
                <a href={githubUrl + 'edit/workbench/' + filePath}>Edit on github</a>
            </small>
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
    return (await getPostsAndTags()).posts.map((post) => post.slug);
}

export default Post;
