import './globals.css'
import '@mantine/core/styles.css';
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
import { ColorSchemeScript, MantineProvider, createTheme } from '@mantine/core';

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
}


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (

    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body className={inter.className}><MantineProvider>{children}</MantineProvider></body>
    </html>
  )
}
