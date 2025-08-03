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
    default: 'Carpooly – Smart Carpooling Made Simple',
    template: '%s | Carpooly'
  },
  description: 'Carpooly is the easiest way to organize carpools for schools, work, and daily commutes. Organize rides easily, save money, and find carpools.',
  keywords: [
    'carpool app',
    'ride sharing app',
    'commute app',
    'carpool planner',
    'work carpool',
    'business carpool',
    'corporate transportation',
    'workplace carpool',
    'school carpool',
    'family carpooling',
    'sustainable commuting',
    'eco-friendly travel',
    'carbon emissions tracker',
    'carpool schedule organizer',
    'green transportation',
    'shared rides',
    'community transportation',
    'transportation app',
    'commuter app',
    'carpool',
    'ride sharing',
    'commute',
    'sustainability',
    'save money',
    'environmental impact',
    'carbon footprint',
    'daily commute',
    'office carpool',
    'company transportation'
  ],
  authors: [{ name: 'Carpooly Team' }],
  creator: 'Carpooly',
  publisher: 'Carpooly',
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
    title: 'Carpooly – Smart Carpooling for Everyone',
    description: 'Organize rides easily, save money, and make carpooling simple. Perfect for schools, work, and daily commutes.',
    siteName: 'Carpooly',
    images: [
      {
        url: '/carpooly-logo.png',
        width: 1200,
        height: 630,
        alt: 'Carpooly - Smart School Carpooling Made Easy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Carpooly – Smart Carpooling for Everyone',
    description: 'Organize rides easily, save money, and make carpooling simple. Perfect for schools, work, and daily commutes.',
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
        
        {/* SEO Meta Tags */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <meta name="bingbot" content="index, follow" />
        <meta name="theme-color" content="#22c55e" />
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        
        {/* Product Hunt Tags */}
        <meta name="product-hunt:tags" content="Productivity,Education,Sustainability,Transportation,Mobile App,Parenting,Social Good" />
        
        {/* Additional SEO */}
        <meta name="application-name" content="Carpooly" />
        <meta name="apple-mobile-web-app-title" content="Carpooly" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-QVJY2D3PD3"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-QVJY2D3PD3');
            `,
          }}
        />
        
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "MobileApplication",
              "name": "Carpooly",
              "description": "Carpooly is the easiest way to organize carpools for schools, work, and daily commutes. Organize rides easily, save money, and build community.",
              "url": "https://carpooly.app",
              "applicationCategory": "TransportationApplication",
              "operatingSystem": "Web, iOS, Android",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "description": "Free to use"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "50"
              },
              "author": {
                "@type": "Organization",
                "name": "Carpooly"
              },
              "keywords": "carpool app, ride sharing app, commute app, work carpool, business carpool, corporate transportation, workplace carpool, school carpool, family carpooling, sustainable commuting, eco-friendly travel, carbon emissions tracker, carpool planner, green transportation"
            })
          }}
        />
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

