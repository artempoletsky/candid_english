import "./globals.css"
import "@mantine/core/styles.layer.css";
import type { Metadata } from "next"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })
import { ColorSchemeScript, MantineProvider, createTheme } from "@mantine/core";
import Header from "components/Header";
import Footer from "components/Footer";
import StoreProvider from "./StoreProvider";
// import Chat from "components/chat/Chat";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
}


export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
        {/* <script src="https://accounts.google.com/gsi/client" async></script> */}
      </head>
      <body className={inter.className}>
        <MantineProvider>
          <StoreProvider>
            {/* <Chat /> */}
            <Header />
            <div className="grow">
              <div className="px-9 mx-auto max-w-[950px]">{children}</div>
            </div>
            <Footer />
          </StoreProvider>
        </MantineProvider>
      </body>
    </html>
  )
}