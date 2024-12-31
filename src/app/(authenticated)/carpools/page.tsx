import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function CarpoolsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Carpools</h1>
      <Button asChild>
        <Link href="/carpools/new">Create New Carpool</Link>
      </Button>
      <div className="mt-8">
        <p>You haven&apos;t created any carpools yet.</p>
      </div>
    </div>
  )
}

