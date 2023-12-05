import Layout from "@/layout"
import { getList } from "~/app/admin/api/wordlist_levels/route";
import DictLink from "@/dictlink";
import { DictRange } from "~/lib/language_levels";

function arrRand<Type>(array: Type[]): Type {
  return array[Math.floor(Math.random() * array.length)];
}

export default async function FiveWords() {
  // const host = headers().get("host");
  // const apiRes = await fetch("/admin/api/worldist_levels");
  // console.log(apiRes);

  const res = getList()
  let by_level: Record<string, string[]> = {};

  for (const key in res) {
    const level = res[key].level;
    if (!by_level[level]) {
      by_level[level] = [];
    }
    by_level[level].push(res[key].word);
  }

  let words = DictRange.map(level => arrRand(by_level[level]));

  return (
    <Layout>
      <ul>
        {words.map((w, i) => <li key={i}><DictLink word={{ id: w, word: w }} service="oxford" type="anchor" /></li>)}
      </ul>
    </Layout>
  );
}