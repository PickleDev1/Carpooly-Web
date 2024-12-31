import Image from "next/image"
import Link from "next/link"
import { SignInButton, UserButton } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SignInRedirect } from "@/components/SignInRedirect"

export default async function Home() {
  const { userId } = await auth()
  
  if (userId) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white p-4 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Image 
              src="/assets/logo/carpooly-logo.jpg" 
              alt="CarPooly Logo" 
              width={32} 
              height={32}
            />
            <span className="text-black text-xl font-semibold">CarPooly</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/create-carpool" className="text-gray-700 hover:text-gray-900">Create Carpool</Link>
            <Link href="/invite" className="text-gray-700 hover:text-gray-900">Invite Friends</Link>
            <Link href="/schedule" className="text-gray-700 hover:text-gray-900">Schedule Updates</Link>
            <Link href="/join" className="text-gray-700 hover:text-gray-900">Join Carpool</Link>
            {userId ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <SignInRedirect className="bg-[#2B5335] hover:bg-[#1e3b25] text-white" size="sm">
                Sign up
              </SignInRedirect>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 flex justify-between items-center">
        <div className="max-w-xl">
          <div className="mb-6">
            <span className="bg-[#E8EDDF] text-[#2B5335] px-4 py-1 rounded-full text-sm font-medium">
              #1 on Parent&apos;s Choice
            </span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Simplify Your<br />Carpool Routine
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            Discover seamless rides with CarPooly – where your kids&apos; schedules and social circle harmonize effortlessly.
          </p>
          {userId ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <SignInRedirect className="bg-[#2B5335] hover:bg-[#1e3b25] text-white px-8 py-3 text-lg">
              Sign up today
            </SignInRedirect>
          )}
        </div>
        <div className="flex-1 ml-20">
          <Image 
            src="/assets/images/carpool-illustration.png" 
            alt="Carpool Illustration" 
            width={600} 
            height={400}
            className="rounded-lg"
          />
        </div>
      </main>

      {/* Social Proof Section */}
      <section className="bg-[#2B5335] text-white py-16 mt-20">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            The #1 Carpool Solution for Parents
          </h2>
          <p className="text-gray-200">
            As recognized by parents around the globe
          </p>
          <div className="flex justify-center space-x-8 mt-12">
            <Image 
              src="/assets/images/social-proof.png" 
              alt="Social Proof Statistics" 
              width={600} 
              height={400}
              className="rounded-lg"
            />
          </div>
        </div>
      </section>
    </div>
  )
}

