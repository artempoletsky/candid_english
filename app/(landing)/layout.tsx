import "./landing.css"

import type { Metadata } from "next"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })
import { ColorSchemeScript, MantineProvider, createTheme } from "@mantine/core";
import { StoreProvider } from "@artempoletsky/easystore";


export const metadata: Metadata = {
  title: "Intermediate Drill",
  description: "A site for learning English",
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
            {children}
          </StoreProvider>
        </MantineProvider>
      </body>
    </html>
  )
}
