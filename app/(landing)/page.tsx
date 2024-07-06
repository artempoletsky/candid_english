import Image from "next/image"
import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen flex justify-center items-center p-5 lg:p-24">
      <div className="">
        <h1><span className="relative">Deal with</span> <br /> Your intermediate plato <br /> For good!</h1>

        <h2>How to use this site</h2>
        <ol>
          <li>Take a <Link href="/test">quick test</Link> to determine your English level.</li>
          <li>Track your <Link href="/edit_my_wordlist">list of known words</Link> starting from this level.</li>
          <li>
            <p>Choose an English content you want to watch and <Link href="/lemmatizer">upload .srt subtitles of it</Link>.</p>
            <p>
              The site will filter words you already know and show you new words to learn.
              <br /> Learn this new words and add them to your vocabulary.
            </p>
            <p>For best results use <a target="_blank" href="https://apps.ankiweb.net/" className="href">Anki</a>.</p>
          </li>
          <li>Watch the content for fun!</li>
        </ol>
      </div>
    </main>
  )
}
