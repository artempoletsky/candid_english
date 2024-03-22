import { Metadata } from "next";
import Link from "next/link";
import Layout from "~/app/components/PageLayout";



export const metadata: Metadata = {
  title: "Login",
};


export default async function WordlistPage() {
  return (
    <Layout>
      <h1>{metadata.title + ""}</h1>
      <input type="text" placeholder="login"/>
      <input type="password" placeholder="password"/>
      <button>Login</button>
    </Layout>
  );
}