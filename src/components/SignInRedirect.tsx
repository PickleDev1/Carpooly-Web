'use client'

import { SignInButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"

interface SignInRedirectProps {
  className?: string
  children: React.ReactNode
  size?: "default" | "sm" | "lg" | "icon"
  redirectUrl?: string
}

export function SignInRedirect({ className, children, size, redirectUrl }: SignInRedirectProps) {
  return (
    <SignInButton mode="modal" forceRedirectUrl={redirectUrl || "/dashboard"}>
      <Button className={className} size={size}>
        {children}
      </Button>
    </SignInButton>
  )
} 