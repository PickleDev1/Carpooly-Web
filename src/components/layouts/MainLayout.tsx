'use client'

import { DesktopHeader } from '@/components/layouts/DesktopHeader'
import { MobileHeader } from '@/components/layouts/MobileHeader'
import { DesktopFooter } from '@/components/layouts/DesktopFooter'
import { MobileNavigation } from '@/components/layouts/MobileNavigation'
import { useUser } from "@clerk/nextjs"
import { usePathname } from 'next/navigation'

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useUser()
  const pathname = usePathname()
  const isHomePage = pathname === '/'

  return (
    <div className="min-h-screen flex flex-col">
      {isSignedIn ? (
        <>
          <DesktopHeader />
          <MobileHeader />
        </>
      ) : (
        <DesktopHeader />
      )}
      
      <main className="flex-1 pt-16 pb-16 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Only show footer on home page or desktop */}
      {(isHomePage || !isSignedIn) ? (
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