import { Head } from '@fsoc/dhow';

export const Header = ({ hero = false, title, href, className = '' }) => (<>
    <header className={`container ${hero ? 'my-4 dark:invert' : 'border-b border-gray-300 mt-4 mb-4 pb-4'}` + className}>
        {hero ? (
            <img src={'/assets/logo.svg'} alt={'fsoc'} className={'mx-auto'} />
        ) : (<>
            <div className={'prose dark:prose-invert text-black dark:text-white'}>
                <a href={'/'}>fsoc</a> / {href ? <a href={href}>{title}</a> : title}
            </div>
        </>)}
    </header>
</>);

const Footer = () => (<>
    <footer className={'flex flex-col prose dark:prose-invert container text-md py-3 mb-1 border-t border-gray-300 mt-4'}>
        <p className={'m-0'}>
            Built with <a href={'https://github.com/fs-c/dhow/tree/rewrite'}>fs-c/dhow</a>,{' '}
            <a href={'https://tailwindcss.com/'}>tailwindcss</a> and <a href={'https://rsms.me/inter/'}>inter</a>.
        </p>

        <p className={'mt-3'}>
            Also, <a href={'/legal'}>imprint & privacy</a>.
        </p>

    </footer>
</>);

const App = ({ Component, pageProps = {} }) => (<>
    <Head>
        <title>{pageProps.title || 'fsoc.space'}</title>
    </Head>

    <div className={'min-h-screen flex flex-col h-full ' + (pageProps.wrapperClassName || '')}>
        <Component {...pageProps} />
    </div>

    <Footer />
</>);

export default App;
