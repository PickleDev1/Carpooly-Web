'use client'

console.log("Dashboard page loaded");

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { InvitesTable } from '@/components/invitesTable'
import { ActiveRideSection } from '@/components/ActiveRideSection'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useAuth, useUser } from '@clerk/nextjs'

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Dashboard() {
  const [isInvitesOpen, setIsInvitesOpen] = useState(true)
  const [isActiveRideOpen, setIsActiveRideOpen] = useState(true)
  const [checkingProfile, setCheckingProfile] = useState(true)
  const router = useRouter();
  const { getToken } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    let isMounted = true;
    async function checkProfile() {
      try {
        if (!user?.id) {
          console.log("No user ID available");
          return;
        }

        const token = await getToken();
        console.log("Checking user data with token:", token);
        const res = await fetch(`${API_URL}/api/users/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('User data not found');
        const userData = await res.json();
        console.log('User data:', userData);
        
        // Only redirect if home coordinates are 0
        if (
          userData.home_latitude === 0 ||
          userData.home_longitude === 0
        ) {
          console.log('Home location not set, redirecting to onboarding');
          if (isMounted) router.replace('/onboarding');
        } else {
          console.log('Home location set, staying on dashboard');
        }
      } catch (e) {
        console.error('Error fetching user data:', e);
        if (isMounted) router.replace('/onboarding');
      } finally {
        if (isMounted) setCheckingProfile(false);
      }
    }
    checkProfile();
    return () => { isMounted = false; };
  }, [router, getToken, user?.id]);

  if (checkingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        <span className="ml-4 text-lg text-gray-700">Loading your dashboard...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <div className="space-y-6">
        {/* Pending Invites Section */}
        <div className="bg-white rounded-lg shadow">
          <button
            onClick={() => setIsInvitesOpen(!isInvitesOpen)}
            className="w-full p-6 flex justify-between items-center hover:bg-gray-50 transition-colors"
          >
            <h2 className="text-xl font-semibold">Pending Invites</h2>
            {isInvitesOpen ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
          
          {isInvitesOpen && (
            <div className="p-6 pt-0">
              <InvitesTable />
            </div>
          )}
        </div>

        {/* Active Ride Section */}
        <div className="bg-white rounded-lg shadow">
          <button
            onClick={() => setIsActiveRideOpen(!isActiveRideOpen)}
            className="w-full p-6 flex justify-between items-center hover:bg-gray-50 transition-colors"
          >
            <h2 className="text-xl font-semibold">Active Carpool Rides</h2>
            {isActiveRideOpen ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
          
          {isActiveRideOpen && (
            <div className="p-6 pt-0">
              <ActiveRideSection />
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 