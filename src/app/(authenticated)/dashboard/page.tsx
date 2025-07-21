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
  ArrowRight,
  HelpCircle,
  Play
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
import { OnboardingTour } from '@/components/OnboardingTour'
import { HelpTips } from '@/components/HelpTips'
import { ContextualTooltip, useTooltips } from '@/components/ContextualTooltip'

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
  const [showOnboardingTour, setShowOnboardingTour] = useState(false)
  const [showHelpTips, setShowHelpTips] = useState(false)
  
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
  const { activeTooltip, showTooltip, hideTooltip, dismissTooltip } = useTooltips();

  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;
    
    console.log('🚀 Dashboard: Profile check effect started');
    console.log('🚀 Dashboard: User ID:', user?.id);
    console.log('🚀 Dashboard: API URL:', API_URL);
    console.log('🚀 Dashboard: Is mobile device:', isMobileDevice());
    console.log('🚀 Dashboard: Is iOS device:', isIOSDevice());
    console.log('🚀 Dashboard: Current URL:', typeof window !== 'undefined' ? window.location.href : 'Server side');
    console.log('🚀 Dashboard: Referrer:', typeof window !== 'undefined' ? document.referrer : 'Server side');
    
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
        console.log('🚀 Dashboard: User data received:', userData);
        console.log('🚀 Dashboard: User data keys:', Object.keys(userData));
        console.log('🚀 Dashboard: User data home location fields:', {
          home_latitude: userData.home_latitude,
          home_longitude: userData.home_longitude,
          has_home_lat: 'home_latitude' in userData,
          has_home_lng: 'home_longitude' in userData
        });
        
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
        
        // Check if home coordinates are valid and non-zero
        console.log('🚀 Dashboard: Checking home location values:', {
          home_latitude: userData.home_latitude,
          home_longitude: userData.home_longitude,
          lat_type: typeof userData.home_latitude,
          lng_type: typeof userData.home_longitude
        });
        
        // Handle both simple values and database objects with Valid property
        const latValue = userData.home_latitude?.Float64 !== undefined ? userData.home_latitude.Float64 : userData.home_latitude;
        const lngValue = userData.home_longitude?.Float64 !== undefined ? userData.home_longitude.Float64 : userData.home_longitude;
        const latValid = userData.home_latitude?.Valid !== undefined ? userData.home_latitude.Valid : true;
        const lngValid = userData.home_longitude?.Valid !== undefined ? userData.home_longitude.Valid : true;
        
        console.log('🚀 Dashboard: Parsed values - lat:', latValue, 'lng:', lngValue, 'latValid:', latValid, 'lngValid:', lngValid);
        
        if (
          latValue === 0 ||
          lngValue === 0 ||
          latValue === null ||
          lngValue === null ||
          latValue === undefined ||
          lngValue === undefined ||
          latValue === '' ||
          lngValue === '' ||
          !latValid ||
          !lngValid
        ) {
          console.log('🚀 Dashboard: Home location not set, redirecting to onboarding');
          console.log('🚀 Dashboard: Redirect reason - lat:', latValue, 'lng:', lngValue, 'latValid:', latValid, 'lngValid:', lngValid);
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
          console.log('🚀 Dashboard: Home location is set, staying on dashboard');
          console.log('🚀 Dashboard: Home coordinates - lat:', latValue, 'lng:', lngValue);
          
          // Show onboarding tour for new users (first time on dashboard)
          const hasSeenTour = localStorage.getItem('hasSeenOnboardingTour');
          if (!hasSeenTour && carpools.length === 0) {
            setTimeout(() => {
              setShowOnboardingTour(true);
            }, 2000); // Show after 2 seconds
          }
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
    if (carpools && invites && user?.id) {
      const calculateStats = async () => {
        try {
          // Calculate miles saved based on completed rides (same as analytics page)
          let calculatedMilesSaved = 0
          
          // Get completed rides data
          const completedRidesData = await api.getCompletedRides(100)
          console.log('📊 Dashboard: Raw completed rides data:', completedRidesData)
          
          if (Array.isArray(completedRidesData) && completedRidesData.length > 0) {
            // Filter rides to only include those where the current user is a participant
            const userRides = completedRidesData.filter(ride => {
              if (!ride.participants || !Array.isArray(ride.participants)) {
                return false
              }
              
              // Check if current user is in the participants array
              const isUserParticipant = ride.participants.some((participant: any) => 
                participant.id === user.id || participant.user_id === user.id
              )
              
              console.log(`📊 Dashboard: Ride ${ride.id}: User ${user.id} is participant: ${isUserParticipant}`)
              return isUserParticipant
            })
            
            console.log(`📊 Dashboard: Filtered ${completedRidesData.length} total rides to ${userRides.length} user rides`)
            
            // Calculate miles saved from user-specific completed rides
            calculatedMilesSaved = userRides.reduce((total, ride) => {
              const rideDistance = ride.miles_saved || 5.0 // Use miles_saved if available, otherwise default to 5 miles
              
              // For user-specific rides, each ride represents miles saved through carpooling
              // We don't multiply by participants since we're only counting rides the user participated in
              const milesSavedForRide = rideDistance
              
              console.log(`📊 Dashboard: Ride ${ride.id}: ${rideDistance} miles saved for user`)
              
              return total + milesSavedForRide
            }, 0)
            
            console.log('📊 Dashboard: Total miles saved from user completed rides:', calculatedMilesSaved)
          } else {
            // Fallback to API calculation if no completed rides data
            calculatedMilesSaved = await api.calculateMilesSaved(user.id)
            console.log('📊 Dashboard: Fallback miles saved from API:', calculatedMilesSaved)
          }
          
          setStats({
            totalCarpools: carpools.length,
            activeRides: activeRidesCount,
            pendingInvites: invites.length,
            milesSaved: Math.round(calculatedMilesSaved)
          })
        } catch (error) {
          console.error('Error calculating stats:', error)
          // Fallback to placeholder calculation
          setStats({
            totalCarpools: carpools.length,
            activeRides: activeRidesCount,
            pendingInvites: invites.length,
            milesSaved: 0
          })
        }
      }
      
      calculateStats()
    }
  }, [carpools, invites, activeRidesCount, user?.id, api])

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
                  onMouseEnter={() => showTooltip({
                    id: 'manual-onboarding',
                    title: 'Go to Onboarding',
                    content: 'Complete your profile setup to start using the app',
                    position: 'top'
                  })}
                  onMouseLeave={hideTooltip}
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
                  onMouseEnter={() => showTooltip({
                    id: 'force-onboarding',
                    title: 'Force Redirect',
                    content: 'Alternative method to navigate to onboarding if the first button doesn\'t work',
                    position: 'top'
                  })}
                  onMouseLeave={hideTooltip}
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
              Ongoing rides
            </p>
            {stats.activeRides > 0 && (
              <Link 
                href="/maps"
                onMouseEnter={() => showTooltip({
                  id: 'view-active-rides',
                  title: 'View Active Rides',
                  content: 'Track your ongoing rides in real-time on the live map',
                  position: 'top'
                })}
                onMouseLeave={hideTooltip}
              >
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
              onMouseEnter={() => showTooltip({
                id: 'pending-invites-link',
                title: 'View Pending Invites',
                content: 'Click to see and respond to carpool invitations',
                position: 'top'
              })}
              onMouseLeave={hideTooltip}
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
              <Link 
                key={action.title} 
                href={action.href}
                onMouseEnter={() => showTooltip({
                  id: `quick-action-${action.title.toLowerCase().replace(/\s+/g, '-')}`,
                  title: action.title,
                  content: action.description,
                  position: 'top'
                })}
                onMouseLeave={hideTooltip}
              >
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
                  onMouseEnter={() => showTooltip({
                    id: 'toggle-invites',
                    title: isInvitesOpen ? 'Collapse Invites' : 'Expand Invites',
                    content: isInvitesOpen ? 'Hide pending carpool invitations' : 'Show pending carpool invitations',
                    position: 'left'
                  })}
                  onMouseLeave={hideTooltip}
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
                  <CardDescription className="text-sm">Ongoing active rides and their status</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsActiveRideOpen(!isActiveRideOpen)}
                  onMouseEnter={() => showTooltip({
                    id: 'toggle-active-rides',
                    title: isActiveRideOpen ? 'Collapse Active Rides' : 'Expand Active Rides',
                    content: isActiveRideOpen ? 'Hide ongoing active carpool rides' : 'Show ongoing active carpool rides',
                    position: 'left'
                  })}
                  onMouseLeave={hideTooltip}
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
                    <InviteActions 
                      inviteId={invite.id} 
                      status={parseInt(invite.status)} 
                      carpoolId={invite.carpool_id}
                      currentAvailableSeats={invite.current_available_seats}
                      onStatusUpdate={refreshInvites} 
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 text-sm sm:text-base">No pending invites</div>
          )}
        </DialogContent>
      </Dialog>

      {/* Help Button - Fixed Position */}
      <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-40">
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => setShowHelpTips(true)}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white shadow-lg text-xs sm:text-sm"
            onMouseEnter={() => showTooltip({
              id: 'help-button',
              title: 'Help & Tips',
              content: 'Get help with using the app and view helpful tips',
              position: 'left'
            })}
            onMouseLeave={hideTooltip}
          >
            <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Help
          </Button>
          <Button
            onClick={() => setShowOnboardingTour(true)}
            size="sm"
            variant="outline"
            className="bg-white hover:bg-gray-50 shadow-lg text-xs sm:text-sm"
            onMouseEnter={() => showTooltip({
              id: 'tour-button',
              title: 'Interactive Tour',
              content: 'Take a guided tour of the app features',
              position: 'left'
            })}
            onMouseLeave={hideTooltip}
          >
            <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Tour
          </Button>
        </div>
      </div>

      {/* Guidance Components */}
      <OnboardingTour
        isOpen={showOnboardingTour}
        onClose={() => {
          setShowOnboardingTour(false);
          localStorage.setItem('hasSeenOnboardingTour', 'true');
        }}
        onComplete={() => {
          setShowOnboardingTour(false);
          localStorage.setItem('hasSeenOnboardingTour', 'true');
        }}
      />

      <HelpTips
        isOpen={showHelpTips}
        onClose={() => setShowHelpTips(false)}
      />

      <ContextualTooltip
        tooltip={activeTooltip}
        onDismiss={dismissTooltip}
        onAction={(id) => {
          // Handle tooltip actions
          console.log('Tooltip action:', id);
        }}
      />
    </div>
  )
} 