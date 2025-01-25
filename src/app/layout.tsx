import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import './globals.css'
import { UserProvider } from '@/contexts/UserContext'
import { Metadata, Viewport } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CarPooly',
  description: 'Simplify your carpool routine',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CarPooly'
  },
}

export const viewport: Viewport = {
  themeColor: '#2B5335',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CarPooly" />
        <link rel="apple-touch-icon" href="/icons/apple-icon-180.png" />
      </head>
      <ClerkProvider>
        <UserProvider>
          <body>{children}</body>
        </UserProvider>
      </ClerkProvider>
    </html>
  )
}

