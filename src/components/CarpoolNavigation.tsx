'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PlusCircle, List, Info } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const navItems = [
  {
    href: '/carpools/create',
    label: 'Create Carpool',
    icon: PlusCircle
  },
  {
    href: '/carpools/list',
    label: 'My Carpools',
    icon: List
  },
  {
    href: '/carpools/details',
    label: 'View Details',
    icon: Info
  }
]

export function CarpoolNavigation() {
  const pathname = usePathname()

  return (
    <Card className="w-64 h-full rounded-none border-r border-t-0 border-b-0 border-l-0">
      <CardContent className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Button
              key={item.href}
              variant={isActive ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link href={item.href}>
                <Icon className="mr-2 h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          )
        })}
      </CardContent>
    </Card>
  )
} 