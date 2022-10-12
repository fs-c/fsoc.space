import { Header } from '../_app';
import { getIndex, getContent } from '../../posts';

const Index = ({ title, content, posts }) => (<>
    <Header title={'words'} href={'/words'} />

    <main className={'container pb-8'}>
        <div className={'prose dark:prose-invert lg:prose-lg'}>
            <h1 className={'mt-4'}>
                {title}
            </h1>

            {content}

            <ul>
                {posts.map((post) => (<>
                    <li>
                        <p><b>{post.title}</b>: {post.description} ({post.humanDate})</p>
                    </li>
                </>))}
            </ul>
        </div>
    </main>
</>);

export default Index;

export const getProps = async (slug) => {
    const index = await getIndex(slug);

    if (!index) {
        throw new Error('Couldn\'t get index ' + slug);
    }

    return index;
}

export const getPaths = async () => {
    return (await getContent()).indices.map((index) => index.slug);
}

