'use client'

import { DesktopHeader } from '@/components/layouts/DesktopHeader'
import { MobileHeader } from '@/components/layouts/MobileHeader'
import { DesktopFooter } from '@/components/layouts/DesktopFooter'
import { MobileNavigation } from '@/components/layouts/MobileNavigation'
import { useUser } from "@clerk/nextjs"
import { usePathname } from 'next/navigation'
import { NetworkStatus } from '@/components/NetworkStatus'
import { UpdatePrompt } from '@/components/UpdatePrompt'
import { PWAPrompt } from '@/components/PWAPrompt'

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useUser()
  const pathname = usePathname()
  const isHomePage = pathname === '/'
  const isAuthenticatedPage = pathname.startsWith('/(authenticated)')

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Network status indicator */}
      <NetworkStatus />
      
      {/* Headers */}
      {isSignedIn ? (
        <>
          <DesktopHeader />
          <MobileHeader />
        </>
      ) : (
        <DesktopHeader />
      )}
      
      {/* Main content */}
      <main className={`flex-1 ${isHomePage ? '' : 'pt-16 pb-16 md:pb-0'}`}>
        {isHomePage ? (
          children
        ) : (
          <div className="container-responsive py-6">
            {children}
          </div>
        )}
      </main>

      {/* PWA and Update prompts */}
      {isAuthenticatedPage && (
        <>
          <PWAPrompt />
          <UpdatePrompt />
        </>
      )}

      {/* Footer and Navigation */}
      {isHomePage || !isSignedIn ? (
        <DesktopFooter />
      ) : (
        <>
          <div className="hidden md:block">
            <DesktopFooter />
          </div>
          <MobileNavigation />
        </>
      )}
    </div>
  )
} 