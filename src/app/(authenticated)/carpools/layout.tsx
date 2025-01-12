import { CarpoolNavigation } from '@/components/CarpoolNavigation'

export default function CarpoolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <CarpoolNavigation />
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  )
} 