import Header from './header';
import Footer from './footer';

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <Header></Header>
            <div className='page_container'>{children}</div>
            <Footer></Footer>
        </>
    )
}