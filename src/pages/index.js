const HeroHeader = () => (<>
    <header className={'container my-4'}>
        <picture>
            <source srcset={'/assets/logo-white.svg'} media={'(prefers-color-scheme: dark)'} />
            <img src={'/assets/logo-black.svg'} alt={'fsoc'} className={'mx-auto'} />
        </picture>
    </header>
</>);

const Home = () => {
    return (<>
        <HeroHeader />

        <main className={'flex flex-col prose dark:prose-invert prose-lg container'}>
            <p>
                Hey there, I'm Laurenz Weixlbaumer, a software developer living in Austria. Online, 
                I mainly go by <code>fsoc</code>. I build things, usually by writing things.
            </p>

            <ul className={'m-0'}>
                <li>
                    You can contact me by email via <code>root@ this domain</code> or through <a href={'https://discordapp.com/users/151759959997153281'}>discord</a>.
                </li>

                <li>
                    I'm on <a href={'https://github.com/fs-c/'}>github/fs-c</a> and <a href={'https://gitlab.com/fsoc'}>gitlab/fsoc</a>.
                </li>

                <li>
                    <a href={'/words'}>More words</a>.
                </li>
            </ul>
        </main>
    </>);
};

export default Home;

export const getProps = () => {
    return {
        wrapperClassName: 'w-full flex flex-col justify-center items-center',
    };
}
