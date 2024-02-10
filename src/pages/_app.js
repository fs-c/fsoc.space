import { Head } from '@fsoc/dhow';
import { Footer } from '../components/';

const App = ({ Component, pageProps = {} }) => (<>
    <Head>
        <title>{pageProps.title || 'fsoc.space'}</title>

        {pageProps.head}
    </Head>

    <div className={'min-h-screen flex flex-col h-full ' + (pageProps.wrapperClassName || '')}>
        <Component {...pageProps} />
    </div>

    <Footer />
</>);

export default App;
