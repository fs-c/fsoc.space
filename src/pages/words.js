import { Header } from './_app';

const Words = () => {
    return (<>
        <Header title={'words'} />

        <div className={'container prose'}>
            <p>
                There used to be a bunch of posts here, but I am unhappy with their 
                contents and formatting. I don't like having to sift through low-quality articles until 
                I find a good one, so I will endeavour not to add to the pile for others.
            </p>

            <p>
                I'm looking forward to when I'll have enough time to touch up some old posts 
                (or to write some new ones) and to put them up here.
            </p>
        </div>
    </>);
};

export default Words;
