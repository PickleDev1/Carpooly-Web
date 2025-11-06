'use client'

import { useState, useEffect } from 'react'
import { CarpoolList } from '@/components/CarpoolList'
import { useApi } from '@/services/api'
import { useMatchingService } from '@/services/matching'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, MessageSquare, Clock } from 'lucide-react'
import Link from 'next/link'

export default function ListCarpoolsPage() {
  const api = useApi()
  const matching = useMatchingService()
  const [incomingRequestsInfo, setIncomingRequestsInfo] = useState<{
    count: number;
    message: string;
    hasRequests: boolean;
    mostRecent?: {
      fromName: string;
      carpoolName?: string;
      timeUntil: string;
      isUrgent: boolean;
    };
  } | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await api.getCurrentUser()
        console.log('User data:', userData)
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    fetchUserData()
  }, [api])

  // Helper to get display name from match request user object
  const getDisplayNameFromRequest = (user: any): string => {
    if (!user) return 'User';
    
    if (user.display_name) {
      if (typeof user.display_name === 'string' && user.display_name.trim()) {
        return user.display_name;
      }
      if (user.display_name?.String && typeof user.display_name.String === 'string' && user.display_name.String.trim()) {
        return user.display_name.String;
      }
    }
    return user.name || 'User';
  };

  // Helper to calculate time until expiry
  const getTimeUntilExpiry = (expiresAt: string | undefined | null): { text: string; isUrgent: boolean } => {
    if (!expiresAt) return { text: 'No expiry date', isUrgent: false };
    
    try {
      const now = new Date();
      const expiry = new Date(expiresAt);
      
      // Check if date is valid
      if (isNaN(expiry.getTime())) {
        return { text: 'Invalid date', isUrgent: false };
      }
      
      const diff = expiry.getTime() - now.getTime();
      
      if (diff <= 0) return { text: 'Expired', isUrgent: true };
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      
      const isUrgent = hours < 24; // Urgent if less than 24 hours
      
      if (days > 0) return { text: `${days}d ${hours % 24}h left`, isUrgent };
      if (hours > 0) return { text: `${hours}h left`, isUrgent };
      return { text: 'Expires soon', isUrgent: true };
    } catch (error) {
      console.error('Error calculating time until expiry:', error);
      return { text: 'Unknown', isUrgent: false };
    }
  };

  // Fetch incoming match requests
  useEffect(() => {
    const fetchIncomingRequests = async () => {
      try {
        const requests = await matching.getRequests()
        
        // Ensure requests and incoming array exist
        if (!requests || !Array.isArray(requests.incoming)) {
          setIncomingRequestsInfo({
            count: 0,
            message: 'No incoming requests',
            hasRequests: false
          })
          return
        }
        
        const pendingIncoming = requests.incoming.filter(r => r && r.status === 'pending')
        
        if (pendingIncoming.length > 0) {
          // Sort by most recent first, with error handling for invalid dates
          const sortedRequests = [...pendingIncoming].sort((a, b) => {
            try {
              const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
              const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
              if (isNaN(dateA)) return 1; // Invalid dates go to end
              if (isNaN(dateB)) return -1;
              return dateB - dateA;
            } catch {
              return 0; // Keep original order if sort fails
            }
          })
          
          const mostRecent = sortedRequests[0]
          if (!mostRecent) {
            // Fallback if somehow no request found
            setIncomingRequestsInfo({
              count: pendingIncoming.length,
              message: `${pendingIncoming.length} pending requests`,
              hasRequests: true
            })
            return
          }
          
          const timeInfo = getTimeUntilExpiry(mostRecent.expires_at)
          const fromName = getDisplayNameFromRequest(mostRecent.from_user)
          
          setIncomingRequestsInfo({
            count: pendingIncoming.length,
            message: pendingIncoming.length === 1 
              ? '1 pending request' 
              : `${pendingIncoming.length} pending requests`,
            hasRequests: true,
            mostRecent: {
              fromName,
              carpoolName: mostRecent.carpool_name || undefined,
              timeUntil: timeInfo.text,
              isUrgent: timeInfo.isUrgent
            }
          })
        } else {
          setIncomingRequestsInfo({
            count: 0,
            message: 'No incoming requests',
            hasRequests: false
          })
        }
      } catch (error) {
        console.error('Failed to fetch incoming requests:', error)
        setIncomingRequestsInfo({
          count: 0,
          message: 'Unable to load requests',
          hasRequests: false
        })
      }
    }

    fetchIncomingRequests()
  }, [matching])

  return (
    <div className="px-2 sm:px-4 py-4 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 px-2 sm:px-0">My Carpools</h1>
      
      {/* Incoming Requests Card */}
      <Card className={`mb-6 mx-2 sm:mx-0 border-l-4 bg-gradient-to-br from-green-50/50 to-white shadow-sm ${
        incomingRequestsInfo?.mostRecent?.isUrgent 
          ? 'border-l-orange-500' 
          : 'border-l-green-500'
      }`}>
        <CardHeader className="px-3 sm:px-6 pb-3">
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2.5 font-semibold text-gray-800">
            <div className={`p-2 rounded-lg ${
              incomingRequestsInfo?.mostRecent?.isUrgent 
                ? 'bg-orange-100' 
                : 'bg-green-100'
            }`}>
              <Bell className={`h-5 w-5 ${
                incomingRequestsInfo?.mostRecent?.isUrgent 
                  ? 'text-orange-600' 
                  : 'text-green-600'
              }`} />
            </div>
            Incoming Requests
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
          {incomingRequestsInfo?.hasRequests && incomingRequestsInfo.mostRecent ? (
            <div className="space-y-3">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                  {incomingRequestsInfo.count === 1 
                    ? `From ${incomingRequestsInfo.mostRecent.fromName}`
                    : `${incomingRequestsInfo.count} requests`
                  }
                </div>
                {incomingRequestsInfo.mostRecent.carpoolName && (
                  <div className="text-base sm:text-lg text-gray-700 font-medium mt-1">
                    &quot;{incomingRequestsInfo.mostRecent.carpoolName}&quot;
                  </div>
                )}
              </div>
              <div className={`flex items-center gap-2 text-sm sm:text-base ${
                incomingRequestsInfo.mostRecent.isUrgent 
                  ? 'text-orange-600' 
                  : 'text-gray-600'
              }`}>
                <div className={`flex items-center gap-1.5 bg-white/60 px-2.5 py-1 rounded-full border ${
                  incomingRequestsInfo.mostRecent.isUrgent 
                    ? 'border-orange-200' 
                    : 'border-green-100'
                }`}>
                  <Clock className={`h-4 w-4 ${
                    incomingRequestsInfo.mostRecent.isUrgent 
                      ? 'text-orange-600' 
                      : 'text-green-600'
                  }`} />
                  <span className="font-medium">{incomingRequestsInfo.mostRecent.timeUntil}</span>
                </div>
                {incomingRequestsInfo.count > 1 && (
                  <span className="text-gray-500 text-sm">
                    • {incomingRequestsInfo.count - 1} more
                  </span>
                )}
              </div>
              <Link 
                href="/matching"
                className="inline-block text-sm font-semibold text-green-600 hover:text-green-700 hover:underline transition-colors"
              >
                View & respond →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                {incomingRequestsInfo ? incomingRequestsInfo.count : 'Loading...'}
              </div>
              <div className="flex items-center gap-2 text-sm sm:text-base text-gray-600">
                <div className="flex items-center gap-1.5 bg-white/60 px-2.5 py-1 rounded-full border border-green-100">
                  <MessageSquare className="h-4 w-4 text-green-600" />
                  <span className="font-medium">{incomingRequestsInfo ? incomingRequestsInfo.message : 'Calculating...'}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <CarpoolList />
    </div>
  )
} 