import { Header } from './_app';

const Home = () => {
    return (<>
        <Header hero />

        <main className={'flex flex-col items-center prose container'}>
            <p>
                Hey there, I'm Laurenz Weixlbaumer, a software developer living in Austria. Online, 
                I mainly go by <code>fsoc</code>. I build things, usually by writing things.
            </p>

            <ul>
                <li>
                    You can contact me by email via <code>root@ this domain</code>.
                </li>

                <li>
                    I'm on <a href={'https://github.com/fs-c/'}>github/fs-c</a> and <a href={'https://gitlab.com/fsoc'}>gitlab/fsoc</a>.
                </li>

                <li>
                    Also available on this domain are a collection of <a href={'/words'}>/words</a> and an archive of <a href={'/files'}>/files</a>.
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
