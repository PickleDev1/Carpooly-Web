import Link from 'next/link'

export function DesktopFooter() {
  return (
    <footer className="hidden md:block bg-green-800 text-white py-4">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center">
          <div>
            <Link href="/about" className="text-gray-200 hover:text-white">About</Link>
          </div>
          <div className="text-sm text-gray-200">
            © {new Date().getFullYear()} Carpooly. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
} 