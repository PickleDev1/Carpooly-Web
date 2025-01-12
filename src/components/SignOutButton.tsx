import { UserButton } from '@clerk/nextjs'

export function SignOutButton() {
  return (
    <UserButton 
      afterSignOutUrl="/"
      signInUrl="/sign-in"
      appearance={{
        elements: {
          avatarBox: "h-8 w-8"
        }
      }}
    />
  )
} 