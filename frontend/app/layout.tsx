import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'GlobeTrotter - Travel & Exploration Platform',
  description: 'Your all-in-one platform for modern UI development, collaboration, and productivity.',
  generator: 'GlobeTrotter',
  icons: {
    icon: '/globetrotter-logo.svg',
    shortcut: '/globetrotter-logo.svg',
    apple: '/globetrotter-logo.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body><ThemeProvider attribute="class" defaultTheme="system" enableSystem>{children}<Toaster /></ThemeProvider></body>
    </html>
  )
}