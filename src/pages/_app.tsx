import { Head } from '@fsoc/dhow';
import { Footer } from '../components';

// todo-ts: i hate this
type PageProps = {
    [key: string]: any;
}

const App = ({ Component, pageProps = {} }: { Component: () => JSX.Element, pageProps: PageProps }) => (<>
    <Head>
        <title>{pageProps.title ?? 'fsoc.space'}</title>

        {pageProps.head}
    </Head>

    <div className={'min-h-screen flex flex-col h-full ' + (pageProps.wrapperClassName || '')}>
        <Component {...pageProps} />
    </div>

    <Footer />
</>);

export default App;
