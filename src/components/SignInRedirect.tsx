'use client'

import { SignInButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"

interface SignInRedirectProps {
  className?: string
  children: React.ReactNode
  size?: "default" | "sm" | "lg" | "icon"
}

export function SignInRedirect({ className, children, size }: SignInRedirectProps) {
  return (
    <SignInButton mode="modal" forceRedirectUrl="/dashboard">
      <Button className={className} size={size}>
        {children}
      </Button>
    </SignInButton>
  )
} 