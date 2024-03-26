
import MyWordlist from "./my_wordlist";
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Edit my wordlist',
};

export default async function EditMyWordlistPage() {
  return (
    <>
      <h1>{"" + metadata.title}</h1>
      <MyWordlist></MyWordlist>
    </>
  );
}