import { ClerkProvider } from '@clerk/nextjs'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import 'leaflet/dist/leaflet.css'
import { UserProvider } from '@/contexts/UserContext'
import { Metadata, Viewport } from 'next'
import { MainLayout } from '@/components/layouts/MainLayout'
import { ToastProvider } from '@/components/ui/toast'
import { ActivityNotificationsClient } from '@/components/ActivityNotificationsClient'

// Enhanced font configuration
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'CarPooly - Simplify Your Carpool Routine',
    template: '%s | CarPooly'
  },
  description: 'Join CarPooly to save money, reduce emissions, and make your daily commute more enjoyable. Find carpools, share rides, and contribute to a greener future.',
  keywords: ['carpool', 'ride sharing', 'commute', 'sustainability', 'green transportation', 'save money'],
  authors: [{ name: 'CarPooly Team' }],
  creator: 'CarPooly',
  publisher: 'CarPooly',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CarPooly',
    startupImage: [
      {
        url: '/icons/icon-192x192.png',
        media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/icons/icon-192x192.png',
        media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/icons/icon-192x192.png',
        media: '(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)',
      },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://carpooly.app',
    title: 'CarPooly - Simplify Your Carpool Routine',
    description: 'Join CarPooly to save money, reduce emissions, and make your daily commute more enjoyable.',
    siteName: 'CarPooly',
    images: [
      {
        url: '/carpooly-logo.png',
        width: 1200,
        height: 630,
        alt: 'CarPooly - Carpooling Made Easy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CarPooly - Simplify Your Carpool Routine',
    description: 'Join CarPooly to save money, reduce emissions, and make your daily commute more enjoyable.',
    images: ['/carpooly-logo.png'],
    creator: '@carpooly',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#22c55e' },
    { media: '(prefers-color-scheme: dark)', color: '#16a34a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/icons/carpooly_logo.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="application-name" content="CarPooly" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CarPooly" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#22c55e" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ToastProvider>
          <ClerkProvider 
            publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
            appearance={{
              elements: {
                formButtonPrimary: 'btn-primary',
                card: 'card',
                headerTitle: 'text-xl font-semibold',
                headerSubtitle: 'text-muted-foreground',
                socialButtonsBlockButton: 'btn-secondary',
                formFieldInput: 'input',
                footerActionLink: 'text-primary hover:text-primary/80',
              },
              variables: {
                colorPrimary: '#22c55e',
                colorBackground: '#ffffff',
                colorInputBackground: '#ffffff',
                colorInputText: '#000000',
              },
            }}
            afterSignInUrl="/dashboard"
            afterSignUpUrl="/dashboard"
            signInUrl="/sign-in"
            signUpUrl="/sign-up"
          >
            <UserProvider>
              <ActivityNotificationsClient />
              <MainLayout>
                {children}
              </MainLayout>
            </UserProvider>
          </ClerkProvider>
        </ToastProvider>
      </body>
    </html>
  )
}

