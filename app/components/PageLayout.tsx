import Header from "./Header";
import Footer from "./footer";

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header></Header>
      <div className="grow">
        <div className="px-9 mx-auto max-w-[950px]">{children}</div>
      </div>
      <Footer></Footer>
    </>
  )
}