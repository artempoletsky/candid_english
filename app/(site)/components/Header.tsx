import Link from "next/link";
import HeaderUser from "./HeaderUser";
import HeaderLink from "./HeaderLink";

export default function Header() {
  return (
    <header className="py-2 gap-3 items-center text-center md:text-left md:flex  bg-white/80 mb-3 drop-shadow-md">
      <div className="flex-wrap md:flex text-[1.1rem] max-w-[1000px] mx-auto">
        <HeaderLink href="/blog">Blog</HeaderLink>
        <HeaderLink href="/wordlist">Explore Oxford's wordlist</HeaderLink>
        <HeaderLink href="/test">Test your level of English</HeaderLink>
        <HeaderLink href="/edit_my_wordlist">Edit your personal wordlist</HeaderLink>
        <HeaderLink href="/lemmatizer">Text lemmatizer</HeaderLink>
      </div>
      <HeaderUser />
      {/* <div className=""></div> */}
    </header>
  )
}
