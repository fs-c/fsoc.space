import { Head } from '@fsoc/dhow';

export const Header = ({ hero = false, title, href, className = '' }) => (<>
    <header className={`container ${hero ? 'my-4' : 'border-b border-gray-300 mt-4 mb-3 pb-1'}` + className}>
        {hero ? (
            <img src={'/assets/logo.svg'} alt={'fsoc'} className={'mx-auto'} />
        ) : (<>
            <div className={'prose text-black'}>
                <a href={'/'}>fsoc</a> / {href ? <a href={href}>{title}</a> : title}
            </div>
        </>)}
    </header>
</>);

const Footer = () => (<>
    <footer className={'flex flex-row gap-2 prose container text-sm py-2 border-t border-gray-300 mt-4 text-gray-500'}>
        <span>Built with <a href={'https://github.com/fs-c/dhow/tree/rewrite'}>fs-c/dhow</a>.</span>

        <div className={'flex-grow'} />

        <a href={'/legal'}>imprint & privacy</a>
    </footer>
</>);

const App = ({ Component, pageProps = {} }) => (<>
    <Head>
        <title>{pageProps.title || 'fsoc.space'}</title>
    </Head>

    <div className={`flex-grow ${pageProps.wrapperClassName || ''}`}>
        <Component {...pageProps} />
    </div>

    <Footer />
</>);

export default App;
