import { UserButton } from '@clerk/nextjs'

export function SignOutButton() {
  return (
    <UserButton 
      afterSignOutUrl="/"
      appearance={{
        elements: {
          avatarBox: "h-8 w-8"
        }
      }}
    />
  )
} 