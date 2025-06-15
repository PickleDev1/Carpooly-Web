"use client";

console.log("Onboarding page loaded");

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";

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
    <div className="max-w-md mx-auto mt-16 bg-white rounded-xl shadow-lg p-8 space-y-8 border border-gray-200">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Welcome to Carpooly!</h1>
      <p className="text-center text-gray-600 mb-6">Set your preferred start address for all carpools and choose if you want to share your location while using the website.</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Start Address</label>
          <input
            id="address"
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
            placeholder="123 Main St, City, State, ZIP"
            value={address}
            onChange={e => setAddress(e.target.value)}
            required
            autoComplete="address-line1"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            id="locationSharing"
            type="checkbox"
            checked={locationSharing}
            onChange={e => setLocationSharing(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="locationSharing" className="text-gray-700">Enable location sharing while using the website</label>
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!address || loading}
        >
          {loading ? "Saving..." : "Save Preferences"}
        </button>
        {error && <div className="text-red-600 text-center mt-2">{error}</div>}
      </form>
    </div>
  );
} 