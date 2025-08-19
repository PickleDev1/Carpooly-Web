import Link from 'next/link'
import Image from 'next/image'
import { UserButton } from '@clerk/nextjs'

export default function MainNav() {
  return (
    <nav className="bg-[#2B5335] shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center space-x-2">
            <Image 
              src="/carpooly-logo.png"
              alt="Carpooly Logo"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="text-xl font-bold text-white">Carpooly</span>
          </Link>
          <div className="flex items-center space-x-6">
            <Link href="/create-carpool" className="text-white hover:text-gray-200">Carpools</Link>
            <Link href="/matching" className="text-white hover:text-gray-200">Find Matches</Link>
            <Link href="/history" className="text-white hover:text-gray-200">History</Link>
            <Link href="/analytics" className="text-white hover:text-gray-200">Analytics</Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    </nav>
  )
}

