'use client'

import { MainLayout } from '@/components/layouts/MainLayout'
import { SignInRedirect } from '@/components/SignInRedirect'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <SignInRedirect />
      {children}
    </>
  )
}

