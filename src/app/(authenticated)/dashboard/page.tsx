'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { InvitesTable } from '@/components/invitesTable'
import { ActiveRideSection } from '@/components/ActiveRideSection'
import { 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Car, 
  MapPin, 
  Users, 
  Calendar,
  Clock,
  TrendingUp,
  Award,
  Bell,
  Search,
  Settings,
  ArrowRight
} from 'lucide-react'
import { useAuth, useUser } from '@clerk/nextjs'
import { useCarpools } from '@/hooks/useCarpools'
import { useInvites } from '@/hooks/useInvites'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { InviteActions } from '@/components/InviteActions'
import { useApi } from '@/services/api'
import { useRecentActivity, Activity } from '@/hooks/useRecentActivity'
import { useActiveRides } from '@/hooks/useActiveRides'
import { NotificationPopup } from '@/components/NotificationPopup'
import { isMobileDevice, isIOSDevice } from '@/lib/utils'

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (isNaN(seconds)) return '';
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minute${Math.floor(seconds / 60) === 1 ? '' : 's'} ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hour${Math.floor(seconds / 3600) === 1 ? '' : 's'} ago`;
  if (seconds < 172800) return 'yesterday';
  return date.toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function getActivityDetails(activity: Activity) {
  switch (activity.type) {
    case 'carpool_created':
      return {
        icon: Car,
        title: 'You created a carpool',
        subtitle: activity.carpool_name ? `"${activity.carpool_name}"` : undefined
      };
    case 'ride_completed':
      return {
        icon: Award,
        title: 'You completed a ride',
        subtitle: activity.destination ? `to ${activity.destination}` : undefined
      };
    case 'invite_sent':
      return {
        icon: Users,
        title: 'You sent an invite',
        subtitle: activity.recipient_email ? `to ${activity.recipient_email}` : undefined
      };
    case 'invite_received':
      return {
        icon: Users,
        title: 'You received an invite',
        subtitle: activity.carpool_name ? `for "${activity.carpool_name}"` : undefined
      };
    default:
      return {
        icon: Car,
        title: activity.title || 'Activity',
        subtitle: activity.carpool_name || undefined
      };
  }
}

export default function Dashboard() {
  const [isInvitesOpen, setIsInvitesOpen] = useState(true)
  const [isActiveRideOpen, setIsActiveRideOpen] = useState(true)
  const [checkingProfile, setCheckingProfile] = useState(true)
  const [stats, setStats] = useState({
    totalCarpools: 0,
    activeRides: 0,
    pendingInvites: 0,
    milesSaved: 0
  })
  const [showInvitesModal, setShowInvitesModal] = useState(false)
  
  const router = useRouter();
  const { getToken } = useAuth();
  const { user } = useUser();
  const { carpools } = useCarpools();
  const { invites, refresh: refreshInvites, isRefreshing } = useInvites();
  const api = useApi();
  const [activeRidesCount, setActiveRidesCount] = useState(0);
  const { activity: recentActivity, isLoading: isActivityLoading, error: activityError } = useRecentActivity(20);
  const { activeRides } = useActiveRides();
  const notifiedRidesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;
    
    console.log('🚀 Dashboard: Profile check effect started');
    console.log('🚀 Dashboard: User ID:', user?.id);
    console.log('🚀 Dashboard: API URL:', API_URL);
    console.log('🚀 Dashboard: Is mobile device:', isMobileDevice());
    console.log('🚀 Dashboard: Is iOS device:', isIOSDevice());
    
    async function checkProfile() {
      try {
        console.log(`🚀 Dashboard: Profile check attempt ${retryCount + 1}/${maxRetries + 1}`);
        
        if (!user?.id) {
          console.log("No user ID available, waiting...");
          // Wait a bit more for user to load on mobile
          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(checkProfile, 1000);
            return;
          }
          console.log("User ID still not available after retries, redirecting to onboarding");
          if (isMounted) {
            console.log('🚀 Dashboard: Attempting router.replace to onboarding');
            router.replace('/onboarding');
            // Fallback to window.location if router doesn't work
            setTimeout(() => {
              console.log('🚀 Dashboard: Fallback to window.location');
              window.location.href = '/onboarding';
            }, 1000);
          }
          return;
        }

        const token = await getToken();
        console.log("Checking user data with token:", token ? "Token received" : "No token");
        
        if (!token) {
          console.log("No token available, redirecting to onboarding");
          if (isMounted) {
            console.log('🚀 Dashboard: No token, attempting router.replace to onboarding');
            router.replace('/onboarding');
            // Fallback to window.location if router doesn't work
            setTimeout(() => {
              console.log('🚀 Dashboard: Fallback to window.location (no token)');
              window.location.href = '/onboarding';
            }, 1000);
          }
          return;
        }
        
        console.log('🚀 Dashboard: Making API call to:', `${API_URL}/api/users/${user.id}`);
        const res = await fetch(`${API_URL}/api/users/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        console.log('🚀 Dashboard: API response status:', res.status);
        
        if (!res.ok) {
          console.error('User data fetch failed:', res.status, res.statusText);
          if (res.status === 404 || res.status === 401) {
            console.log('User not found or unauthorized, redirecting to onboarding');
            if (isMounted) {
              console.log('🚀 Dashboard: User not found, attempting router.replace to onboarding');
              router.replace('/onboarding');
              // Fallback to window.location if router doesn't work
              setTimeout(() => {
                console.log('🚀 Dashboard: Fallback to window.location (user not found)');
                window.location.href = '/onboarding';
              }, 1000);
            }
            return;
          }
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const userData = await res.json();
        console.log('User data received:', userData);
        
        // Check if user data is valid
        if (!userData || typeof userData !== 'object') {
          console.log('Invalid user data received, redirecting to onboarding');
          if (isMounted) {
            console.log('🚀 Dashboard: Invalid user data, attempting router.replace to onboarding');
            router.replace('/onboarding');
            // Fallback to window.location if router doesn't work
            setTimeout(() => {
              console.log('🚀 Dashboard: Fallback to window.location (invalid data)');
              window.location.href = '/onboarding';
            }, 1000);
          }
          return;
        }
        
        // Only redirect if home coordinates are 0 or null/undefined
        if (
          userData.home_latitude === 0 ||
          userData.home_longitude === 0 ||
          userData.home_latitude === null ||
          userData.home_longitude === null ||
          userData.home_latitude === undefined ||
          userData.home_longitude === undefined
        ) {
          console.log('Home location not set, redirecting to onboarding');
          if (isMounted) {
            console.log('🚀 Dashboard: Home location not set, attempting router.push to onboarding');
            // Use push instead of replace for better mobile compatibility
            router.push('/onboarding');
            // Fallback to window.location if router doesn't work
            setTimeout(() => {
              console.log('🚀 Dashboard: Fallback to window.location (no home location)');
              window.location.href = '/onboarding';
            }, 1000);
          }
        } else {
          console.log('Home location set, staying on dashboard');
        }
      } catch (e: any) {
        console.error('Error fetching user data:', e);
        
        // Retry logic for network errors
        if (retryCount < maxRetries && e.message && e.message.includes('fetch')) {
          retryCount++;
          console.log(`Retrying profile check (${retryCount}/${maxRetries})...`);
          setTimeout(checkProfile, 2000);
          return;
        }
        
        // If all retries failed or it's not a network error, redirect to onboarding
        console.log('Profile check failed after retries, redirecting to onboarding');
        if (isMounted) {
          console.log('🚀 Dashboard: Profile check failed, attempting router.push to onboarding');
          router.push('/onboarding');
          // Fallback to window.location if router doesn't work
          setTimeout(() => {
            console.log('🚀 Dashboard: Fallback to window.location (profile check failed)');
            window.location.href = '/onboarding';
          }, 1000);
        }
      } finally {
        if (isMounted) setCheckingProfile(false);
      }
    }
    
    // Add a small delay for mobile devices to ensure everything is loaded
    const delay = isMobileDevice() ? 500 : 0;
    console.log('🚀 Dashboard: Setting up profile check with delay:', delay, 'ms');
    setTimeout(checkProfile, delay);
    
    return () => { isMounted = false; };
  }, [router, getToken, user?.id]);

  useEffect(() => {
    let isMounted = true;
    async function fetchActiveRides() {
      try {
        const rides = await api.getActiveRides();
        if (isMounted) setActiveRidesCount(rides?.length || 0);
      } catch (e) {
        if (isMounted) setActiveRidesCount(0);
      }
    }
    fetchActiveRides();
    // Optionally, poll every 30s for real-time update
    const interval = setInterval(fetchActiveRides, 30000);
    return () => { isMounted = false; clearInterval(interval); };
  }, [api]);

  // Calculate stats
  useEffect(() => {
    if (carpools && invites) {
      setStats({
        totalCarpools: carpools.length,
        activeRides: activeRidesCount,
        pendingInvites: invites.length,
        milesSaved: Math.round(carpools.length * 15) // Placeholder calculation
      })
    }
  }, [carpools, invites, activeRidesCount])

  useEffect(() => {
    console.log('🔔 Dashboard: Browser notification effect triggered')
    const notificationApiAvailable = typeof window !== 'undefined' && 'Notification' in window;
    console.log('🔔 Dashboard: Notification API available:', notificationApiAvailable)
    if (!notificationApiAvailable) {
      console.log('🔔 Dashboard: Notification API not available, skipping')
      return;
    }
    // Now safe to reference Notification
    console.log('🔔 Dashboard: Notification permission:', Notification.permission)
    if (Notification.permission !== 'granted') {
      console.log('🔔 Dashboard: Notification permission not granted, skipping')
      return;
    }
    
    console.log('🔔 Dashboard: Setting up notification interval, active rides count:', activeRides.length)
    const interval = setInterval(() => {
      console.log('🔔 Dashboard: Notification interval triggered, checking rides...')
      const now = new Date();
      console.log('🔔 Dashboard: Current time:', now.toISOString())
      activeRides.forEach((ride, index) => {
        console.log(`🔔 Dashboard: Checking ride ${index + 1}:`, ride)
        if (!ride.start_time || !ride.id) {
          console.log(`🔔 Dashboard: Skipping ride ${index + 1} - missing start_time or id`)
          return;
        }
        const start = new Date(ride.start_time);
        const diff = (start.getTime() - now.getTime()) / 60000; // minutes
        console.log(`🔔 Dashboard: Ride ${index + 1} - Start: ${start.toISOString()}, Diff: ${diff} minutes, Already notified: ${notifiedRidesRef.current.has(ride.id)}`)
        if (diff > 0 && diff < 15 && !notifiedRidesRef.current.has(ride.id)) {
          console.log(`🔔 Dashboard: Sending browser notification for ride ${ride.id}`)
          const carpoolName = ride.carpool_name || 'your carpool'
          const destination = ride.destination_address || 'your destination'
          // Show notification
          new Notification('Upcoming Ride', {
            body: `${carpoolName} to ${destination} starts at ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            icon: '/assets/logo/carpooly-logo.jpg',
          });
          notifiedRidesRef.current.add(ride.id);
          console.log(`🔔 Dashboard: Browser notification sent and ride ${ride.id} marked as notified`)
        }
      });
    }, 60000); // check every minute
    console.log('🔔 Dashboard: Notification interval set up successfully')
    return () => {
      console.log('🔔 Dashboard: Cleaning up notification interval')
      clearInterval(interval)
    };
  }, [activeRides]);

  if (checkingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="loading-spinner h-12 w-12 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">
            {isMobileDevice() 
              ? "This may take a moment on mobile devices" 
              : "Please wait while we load your data"
            }
          </p>
          
          {/* Manual redirect fallback for mobile users */}
          {isMobileDevice() && (
            <div className="mt-6">
              <p className="text-sm text-gray-500 mb-3">
                Taking too long? You can manually navigate:
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => {
                    console.log('🚀 Dashboard: Manual redirect to onboarding');
                    router.push('/onboarding');
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Go to Onboarding
                </Button>
                <Button
                  onClick={() => {
                    console.log('🚀 Dashboard: Manual window.location redirect to onboarding');
                    window.location.href = '/onboarding';
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Force Redirect (Onboarding)
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      title: 'Create Carpool',
      description: 'Start a new carpool ride',
      icon: Plus,
      href: '/create-carpool',
      color: 'bg-primary text-primary-foreground'
    },
    {
      title: 'My Carpools',
      description: 'View and manage your carpools',
      icon: Car,
      href: '/carpools/list',
      color: 'bg-blue-500 text-white'
    },
    {
      title: 'Live Map',
      description: 'Track active rides',
      icon: MapPin,
      href: '/maps',
      color: 'bg-green-500 text-white'
    },
    {
      title: 'Analytics',
      description: 'View your impact',
      icon: TrendingUp,
      href: '/analytics',
      color: 'bg-purple-500 text-white'
    }
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName || 'there'}! 👋
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Here&apos;s what&apos;s happening with your carpools today
          </p>
        </div>
        <div className="flex items-center gap-3">
          <NotificationPopup />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Carpools</CardTitle>
            <Car className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold">{stats.totalCarpools}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalCarpools === 0 
                ? "Start your first carpool" 
                : stats.totalCarpools === 1 
                ? "Your carpool journey begins" 
                : stats.totalCarpools < 5 
                ? "Building your carpool network" 
                : "Active carpool community"
              }
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Active Rides</CardTitle>
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold">{stats.activeRides}</div>
            <p className="text-xs text-muted-foreground">
              Currently in progress
            </p>
            {stats.activeRides > 0 && (
              <Link href="/maps">
                <Button variant="outline" size="sm" className="mt-2 w-full text-xs">
                  View Active Rides
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Pending Invites</CardTitle>
            <div className="flex items-center gap-2">
              {isRefreshing && (
                <div className="w-2 h-2 sm:w-3 sm:h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              )}
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold">{stats.pendingInvites}</div>
            <button
              className="text-xs text-muted-foreground underline hover:text-primary focus:outline-none"
              onClick={() => setShowInvitesModal(true)}
              disabled={stats.pendingInvites === 0}
            >
              Awaiting response
            </button>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Miles Saved</CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold">{stats.milesSaved}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.title} href={action.href}>
                <Card className="card-interactive group">
                  <CardContent className="p-4 sm:p-6">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 ${action.color} rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">{action.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">{action.description}</p>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-base sm:text-lg">Recent Activity</CardTitle>
              <CardDescription className="text-sm">Your latest carpool activities</CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              {isActivityLoading ? (
                <div className="py-4 text-center text-gray-500 text-sm">Loading activity...</div>
              ) : activityError ? (
                <div className="py-4 text-center text-red-500 text-sm">Failed to load activity</div>
              ) : recentActivity.length === 0 ? (
                <div className="py-4 text-center text-gray-500 text-sm">No recent activity</div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {recentActivity.map((activity, index) => {
                    const { icon: Icon, title, subtitle } = getActivityDetails(activity);
                    const timestamp = activity.timestamp || activity.time || '';
                    return (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium">{title}</p>
                          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
                          <p className="text-xs text-muted-foreground">{timestamp ? timeAgo(timestamp) : ''}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Pending Invites Section */}
          <Card>
            <CardHeader className="px-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base sm:text-lg">Pending Invites</CardTitle>
                  {isRefreshing && (
                    <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsInvitesOpen(!isInvitesOpen)}
                >
                  {isInvitesOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <CardDescription className="text-sm">Respond to carpool invitations</CardDescription>
            </CardHeader>
            
            {isInvitesOpen && (
              <CardContent className="px-4 sm:px-6">
                <InvitesTable />
              </CardContent>
            )}
          </Card>

          {/* Active Ride Section */}
          <Card>
            <CardHeader className="px-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base sm:text-lg">Active Carpool Rides</CardTitle>
                  <CardDescription className="text-sm">Currently active rides and their status</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsActiveRideOpen(!isActiveRideOpen)}
                >
                  {isActiveRideOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            
            {isActiveRideOpen && (
              <CardContent className="px-4 sm:px-6">
                <ActiveRideSection />
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      {/* Pending Invites Modal */}
      <Dialog open={showInvitesModal} onOpenChange={setShowInvitesModal}>
        <DialogContent className="w-[95vw] max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Pending Carpool Invites</DialogTitle>
          </DialogHeader>
          {invites && invites.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {invites.map((invite) => (
                <div key={invite.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b pb-3 last:border-b-0 last:pb-0">
                  <div>
                    <div className="font-medium text-gray-900 text-sm sm:text-base">{invite.carpool_name || 'Unknown Carpool'}</div>
                    <div className="text-xs sm:text-sm text-gray-500">From: {invite.sender_email || 'Unknown Sender'}</div>
                  </div>
                  <div>
                    <InviteActions inviteId={invite.id} status={parseInt(invite.status)} onStatusUpdate={refreshInvites} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 text-sm sm:text-base">No pending invites</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 