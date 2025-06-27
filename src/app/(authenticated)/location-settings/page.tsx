'use client'

import { LocationSettings } from '@/components/LocationSettings'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function LocationSettingsPage() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-[#2B5335] hover:text-[#1a3a24] transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Dashboard
        </Link>
      </div>

      {/* Page Title */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-[#2B5335]">
            Location Settings
          </CardTitle>
          <p className="text-gray-600">
            Manage your location sharing preferences and privacy settings
          </p>
        </CardHeader>
      </Card>

      {/* Location Settings Component */}
      <LocationSettings />
    </div>
  )
} 