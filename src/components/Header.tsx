interface HeaderElement {
    title: string;
    href?: string;
}

export const Header = ({ elements }: { elements: HeaderElement[] }) => (<>
    <header className={'container border-b border-gray-300 dark:border-gray-600 mt-4 mb-4 pb-4'}>
        <div className={'prose dark:prose-invert text-black dark:text-white'}>
            <a href={'/'}>fsoc</a>{elements.map((element) => <>
                {' / '}{element.href ? <a href={element.href}>{element.title}</a> : element.title}
            </>)}
        </div>
    </header>
</>);
