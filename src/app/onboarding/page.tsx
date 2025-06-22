"use client";

console.log("Onboarding page loaded");

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function OnboardingPage() {
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationSharing, setLocationSharing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  const geocodeAddress = async (address: string) => {
    // Use OpenStreetMap Nominatim API
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    throw new Error("Address not found. Please enter a valid address.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const coords = await geocodeAddress(address);
      setLocation(coords);
      const token = await getToken();
      console.log("Clerk token:", token);
      
      // Update the profile
      const updateRes = await fetch(`${API_URL}/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          home_latitude: coords.lat,
          home_longitude: coords.lng,
          location_sharing_enabled: locationSharing,
        }),
      });
      if (!updateRes.ok) throw new Error(await updateRes.text());

      // Verify the profile was updated
      const verifyRes = await fetch(`${API_URL}/api/users/${user?.id}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!verifyRes.ok) throw new Error('Failed to verify profile update');
      
      const userData = await verifyRes.json();
      if (
        userData.home_latitude === 0 ||
        userData.home_longitude === 0
      ) {
        throw new Error('Profile update verification failed');
      }

      // Only redirect after verifying the update
      router.push("/dashboard");
    } catch (e: any) {
      setError(e.message || "Failed to save preferences");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto mt-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Welcome to Carpooly!</CardTitle>
          <CardDescription className="text-center">
            Set your preferred start address for all carpools and choose if you want to share your location while using the website.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="address">Start Address</Label>
              <Input
                id="address"
                type="text"
                placeholder="123 Main St, City, State, ZIP"
                value={address}
                onChange={e => setAddress(e.target.value)}
                required
                autoComplete="address-line1"
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
              disabled={!address || loading}
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
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 