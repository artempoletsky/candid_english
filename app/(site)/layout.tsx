import "./globals.css"
import "@mantine/core/styles.layer.css";
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })
import { ColorSchemeScript, MantineProvider, createTheme } from "@mantine/core";
import Header from "components/Header";
import Footer from "components/Footer";
import { StoreProvider } from "@artempoletsky/easystore";
import { SITE_NAME } from "app/globals";
// import StoreProvider from "./StoreProvider";
// import Chat from "components/chat/Chat";

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_NAME,
  applicationName: SITE_NAME,
  robots: "index,follow,archive",
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  // userScalable: false,
  // Also supported by less commonly used
  // interactiveWidget: 'resizes-visual',
}

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1" /> */}
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
