
import PageTest from "./PageTest";
import { Metadata } from "next";
import ComponentLoader from "../components/ComponentLoader";
import { rpc } from "app/rpc";

export const metadata: Metadata = {
  title: "Test your level of English",
};

export default function page() {
  
  
  return (
    <>
      <h1>{metadata.title as string}</h1>
      <ComponentLoader
        Component={PageTest}
        args={{}}
        method={rpc("exam").hackRoute("createSession")}
      />
    </>
  );
}