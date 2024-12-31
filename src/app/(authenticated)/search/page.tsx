import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SearchPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Find Carpools</h1>
      <div className="flex gap-4">
        <Input placeholder="Enter destination or route" className="flex-grow" />
        <Button>Search</Button>
      </div>
      <div className="mt-8">
        <p>No carpools found. Try adjusting your search.</p>
      </div>
    </div>
  )
}

