'use client'

import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'

export function Header() {
  return (
    <header className="bg-green-800 text-white">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <span className="text-2xl font-bold">Carpooly</span>
        </Link>
        <nav className="flex items-center space-x-6">
          <Link href="/carpools">Carpools</Link>
          <Link href="/history">History</Link>
          <Link href="/analytics">Analytics</Link>
          <UserButton afterSignOutUrl="/" />
        </nav>
      </div>
    </header>
  )
} 