import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white/80">
      <div className="flex text-[1.1rem] max-w-[1000px] mx-auto">
        <Link className="py-5 px-3" href="/blog">Blog</Link>
        <Link className="py-5 px-3" href="/wordlist">Explore Oxford's wordlist</Link>
        <Link className="py-5 px-3" href="/test">Test your level of English</Link>
        <Link className="py-5 px-3" href="/edit_my_wordlist">Edit your personal wordlist</Link>
        <Link className="py-5 px-3" href="/lemmatizer">Text lemmatizer</Link>
      </div>
    </header>
  )
}
