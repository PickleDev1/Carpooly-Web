"use client";

console.log("Onboarding page loaded");
console.log("Onboarding: User agent:", typeof window !== 'undefined' ? navigator.userAgent : 'Server side');
console.log("Onboarding: Is mobile device:", typeof window !== 'undefined' ? /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) : 'Unknown');

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { Loader2 } from "lucide-react";
import { isMobileDevice, isIOSDevice } from "@/lib/utils";
import { useLoadScript } from '@react-google-maps/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const libraries: ("places")[] = ["places"];

export default function OnboardingPage() {
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationSharing, setLocationSharing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { isLoaded: loadIsLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  // Add a fallback to redirect to dashboard if user already has location set
  useEffect(() => {
    if (isLoaded && user?.id) {
      checkIfUserAlreadyHasLocation();
    }
  }, [isLoaded, user?.id]);

  const checkIfUserAlreadyHasLocation = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch(`${API_URL}/api/users/${user?.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const userData = await res.json();
        if (
          userData.home_latitude &&
          userData.home_longitude &&
          userData.home_latitude !== 0 &&
          userData.home_longitude !== 0
        ) {
          console.log('User already has location set, redirecting to dashboard');
          router.replace('/dashboard');
        }
      }
    } catch (e) {
      console.error('Error checking user location:', e);
    }
  };

  const handleAddressSelect = (locationData: { address: string; lat: number; lng: number }) => {
    setAddress(locationData.address);
    setLocation({ lat: locationData.lat, lng: locationData.lng });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!location) {
      setError("Please select a valid address from the suggestions");
      setLoading(false);
      return;
    }
    
    try {
      const token = await getToken();
      console.log("Clerk token:", token ? "Token received" : "No token");
      
      if (!token) {
        setError("Authentication failed. Please try refreshing the page.");
        setLoading(false);
        return;
      }
      
      // Update the profile
      const updateRes = await fetch(`${API_URL}/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          home_latitude: location.lat,
          home_longitude: location.lng,
          location_sharing_enabled: locationSharing,
        }),
      });
      
      if (!updateRes.ok) {
        const errorText = await updateRes.text();
        console.error('Profile update failed:', updateRes.status, errorText);
        throw new Error(`Failed to update profile: ${updateRes.status}`);
      }

      // Verify the profile was updated
      const verifyRes = await fetch(`${API_URL}/api/users/${user?.id}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (!verifyRes.ok) {
        console.error('Profile verification failed:', verifyRes.status);
        throw new Error('Failed to verify profile update');
      }
      
      const userData = await verifyRes.json();
      console.log('Profile verification data:', userData);
      
      if (
        userData.home_latitude === 0 ||
        userData.home_longitude === 0 ||
        userData.home_latitude === null ||
        userData.home_longitude === null ||
        userData.home_latitude === undefined ||
        userData.home_longitude === undefined
      ) {
        throw new Error('Profile update verification failed');
      }

      // Only redirect after verifying the update
      console.log('Profile updated successfully, redirecting to dashboard');
      router.push("/dashboard");
    } catch (e: any) {
      console.error('Onboarding error:', e);
      setError(e.message || "Failed to save preferences. Please try again.");
      
      // Retry logic for network errors
      if (retryCount < 2 && e.message && e.message.includes('fetch')) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          setError(null);
          handleSubmit(e);
        }, 2000);
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadError) {
    return <div className="text-center text-red-600 mt-16">Error loading Google Maps: {loadError.message}</div>;
  }
  if (!loadIsLoaded) {
    return <div className="text-center mt-16">Loading Google Maps...</div>;
  }

  return (
    <div className="container max-w-md mx-auto mt-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Welcome to Carpooly!</CardTitle>
          <CardDescription className="text-center">
            Set your preferred start address for all carpools and choose if you want to share your location while using the website.
            {isMobileDevice() && (
              <span className="block text-sm text-blue-600 mt-2">
                📱 Mobile optimized for better experience
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="address">Start Address</Label>
              <AddressAutocomplete
                onSelect={handleAddressSelect}
                placeholder="123 Main St, City, State, ZIP"
              />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="locationSharing" className="flex-1">
                Enable location sharing while using the website
              </Label>
              <Switch
                id="locationSharing"
                checked={locationSharing}
                onCheckedChange={setLocationSharing}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={!address || !location || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Preferences"
              )}
            </Button>
            {error && (
              <div className="text-sm text-red-500 text-center bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}
            
            {/* Manual redirect option for mobile users */}
            <div className="text-center mt-4">
              <p className="text-sm text-gray-500 mb-2">
                Having trouble? You can also:
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="text-sm"
              >
                Skip for now and go to dashboard
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 