'use client'

import { SignUpButton, useAuth } from "@clerk/nextjs"
import Link from 'next/link'
import Image from "next/image"

export default function HomePage() {
  const { isSignedIn } = useAuth()

  return (
    <div className="px-4 py-8 w-full max-w-[100vw] overflow-x-hidden">
      <div className="w-full max-w-6xl mx-auto md:flex md:items-center md:gap-12">
        {/* Left content */}
        <div className="md:w-1/2">
          <div className="bg-green-50 rounded-lg px-4 py-2 mb-6 inline-block">
            <p className="text-green-800 font-medium text-sm md:text-base">
              #1 on Parent&apos;s Choice
            </p>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-6 break-words">
            Simplify Your Carpool Routine
          </h1>

          <p className="text-gray-600 text-base md:text-xl mb-8">
            Discover seamless rides with CarPooly – where your kids&apos; schedules 
            and social circle harmonize effortlessly.
          </p>

          {isSignedIn ? (
            <Link 
              href="/dashboard" 
              className="w-full sm:w-auto bg-green-700 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-green-800 transition-colors inline-block text-center"
            >
              Go to Dashboard
            </Link>
          ) : (
            <SignUpButton mode="modal">
              <button className="w-full sm:w-auto bg-green-700 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-green-800 transition-colors">
                Sign up today
              </button>
            </SignUpButton>
          )}
        </div>

        {/* Right content */}
        <div className="hidden md:block md:w-1/2">
          <div className="relative">
            <Image
              src="/assets/images/carpool-illustration.png"
              alt="Carpool Illustration"
              width={600}
              height={600}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  )
}

