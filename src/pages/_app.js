import { Head } from '@fsoc/dhow';

export const Header = ({ hero = false, title, href, className = '' }) => (<>
    <header className={`container ${hero ? 'my-4' : 'border-b border-gray-300 dark:border-gray-600 mt-4 mb-4 pb-4'}` + className}>
        {hero ? (
            <picture>
                <source srcset={'/assets/logo-white.svg'} media={'(prefers-color-scheme: dark)'} />
                <img src={'/assets/logo-black.svg'} alt={'fsoc'} className={'mx-auto'} />
            </picture>
        ) : (<>
            <div className={'prose dark:prose-invert text-black dark:text-white'}>
                <a href={'/'}>fsoc</a> / {href ? <a href={href}>{title}</a> : title}
            </div>
        </>)}
    </header>
</>);

const Footer = () => (<>
    <footer className={'flex flex-row justify-between prose dark:prose-invert container text-md py-3 mb-1 border-t border-gray-300 dark:border-gray-600 mt-4'}>
        <p className={'m-0'}>
            Built with <a href={'https://github.com/fs-c/dhow/tree/rewrite'}>fs-c/dhow</a>.
        </p>

        <a href={'/legal'}>imprint & privacy</a>
    </footer>
</>);

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
