'use client'

import Link from 'next/link'

export function MobileHeader() {
  return (
    <header className="fixed top-0 w-full bg-green-800 text-white z-50 md:hidden">
      <div className="container mx-auto px-4 py-2">
        <Link href="/dashboard" className="flex items-center gap-2 hover:text-gray-200">
          <img src="/assets/logo/carpooly-logo.jpg" alt="CarPooly" className="h-8 w-8" />
          <span className="font-bold">CarPooly</span>
        </Link>
      </div>
    </header>
  )
} 