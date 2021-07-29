import { Header } from './_app';

const Page = () => (<>
    <Header title={'privacy'} />

    <div className={'container prose'}>
        <p>
            As required by Austrian law.
        </p>

        <p>
            <i>I do not collect, process or otherwise handle any personal data of site visitors.</i> This 
            site runs on infrastructure provided by GitHub, Inc. via 
            their <a href={'https://pages.github.com/'}>GitHub Pages</a> service. For information 
            on the data which GitHub, Inc. collects, see 
            their <a href={'https://docs.github.com/en/github/site-policy/github-privacy-statement'}>Privacy Statement</a> (accessed 2021-04-24).
        </p>

        <p>
            Since this site doesn't have user accounts, cookies or similar, any data GitHub, Inc. may 
            collect is not considered to be personal data.
        </p>

        <p>
            Apart from what has been mentioned, no data is being collected.
        </p>
    </div>
</>);

export default Page;
