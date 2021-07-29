export const Header = ({ hero = false, title, className = '' }) => (<>
    <header className={'container my-2' + className}>
        {hero ? (
            <img src={'/assets/logo.svg'} alt={'fsoc'} className={'mx-auto'} />
        ) : (<>
            <div className={'prose font-mono mt-4'}>
                <a href={'/'}>fsoc</a>{title ? <>/<span className={'font-bold'}>{title}</span></> : <></>}
            </div>
        </>)}
    </header>
</>);

const Footer = () => (<>
    <footer className={'flex flex-row gap-2 prose container text-sm py-2 border-t border-gray-300'}>
        <span>Built with <a href={'https://github.com/fs-c/dhow/tree/rewrite'}>fs-c/dhow</a>.</span>

        <div className={'flex-grow'} />

        <a href={'/imprint'}>/imprint</a>
        <a href={'/privacy'}>/privacy</a>
    </footer>
</>);

const App = ({ Component, pageProps = {} }) => (<>
    <main className={`flex-grow ${pageProps.wrapperClassName || ''}`}>
        <Component {...pageProps} />
    </main>

    <Footer />
</>);

export default App;
