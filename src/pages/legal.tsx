import { Header } from '../components';

const address = `root@fsoc.space
+43 699 17057679

Laurenz Weixlbaumer
Hittmairstraße 64
4020 Linz
Austria`;

const Legal = () => (<>
    <Header elements={[{ title: 'words', href: '/words' }, { title: 'legal' }]} />

    <div className={'container prose dark:prose-invert'}>
        <p>
            As required by Austrian law.
        </p>

        <p>
            <i>I do not collect, process or otherwise handle any personal data of site visitors</i>, unless 
            you send me an email, in which case its contents and metadata will be stored for the 
            duration and purposes of our correspondence. There are no public user accounts. Cookies or 
            equivalent technologies are not used.
        </p>

        <p>
            This site runs on infrastructure provided by GitHub, Inc. via 
            their <a href={'https://pages.github.com/'}>GitHub Pages</a> service. For information 
            on the data which GitHub, Inc. may collect, see 
            their <a href={'https://docs.github.com/en/github/site-policy/github-privacy-statement'}>Privacy Statement</a>.
        </p>

        <hr />

        <pre className={'mb-2'}>
            {address}
        </pre>

        <p>
            Kleinunternehmer, Umsatzsteuerfrei nach § 6(1)27 UStG.
            Mitglied der Wirtschaftskammer OÖ, Fachgruppe 704 (Informationstechnologie). 
        </p>
    </div>
</>);

export default Legal;
