"use client"

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth, useUser, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://car-backend-latest-884945568547.us-west1.run.app";

export default function InvitePage() {
  const router = useRouter();
  const params = useParams();
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [invite, setInvite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const code = params.code as string;

  // Debug: Log all state changes
  useEffect(() => {
    console.log('[InvitePage] State update - isSignedIn:', isSignedIn, 'code:', code, 'authChecked:', authChecked, 'loading:', loading);
  }, [isSignedIn, code, authChecked, loading]);

  // First, check if we have a stored invite code and user is authenticated
  useEffect(() => {
    console.log('[InvitePage] Initial auth check: isSignedIn:', isSignedIn, 'code:', code);
    
    if (!code) {
      console.log('[InvitePage] No code provided, checking for stored code');
      const storedCode = sessionStorage.getItem('pendingInviteCode');
      console.log('[InvitePage] Stored code found:', storedCode);
      if (storedCode && isSignedIn) {
        console.log('[InvitePage] Found stored code, redirecting to:', `/invite/${storedCode}`);
        sessionStorage.removeItem('pendingInviteCode');
        router.push(`/invite/${storedCode}`);
        return;
      }
      setError('No invite code provided');
      setLoading(false);
      setAuthChecked(true);
      return;
    }

    // If user is not signed in, store the code and redirect to sign-in
    if (!isSignedIn && code) {
      console.log('[InvitePage] User not signed in, storing invite code:', code);
      try {
        sessionStorage.setItem('pendingInviteCode', code);
        console.log('[InvitePage] Successfully stored invite code in sessionStorage');
        
        // Verify the code was stored
        const storedCode = sessionStorage.getItem('pendingInviteCode');
        console.log('[InvitePage] Verification - stored code:', storedCode);
        
        console.log('[InvitePage] Redirecting to sign-up with redirect_url:', `/sign-up?redirect_url=/invite/${code}`);
        router.push(`/sign-up?redirect_url=/invite/${code}`);
      } catch (error) {
        console.error('[InvitePage] Error storing invite code:', error);
        setError('Failed to process invite. Please try again.');
        setLoading(false);
        setAuthChecked(true);
      }
      return;
    }

    // If user is signed in and we have a code, proceed to load invite details
    if (isSignedIn && code) {
      console.log('[InvitePage] User signed in, loading invite details for code:', code);
      setAuthChecked(true);
    }
  }, [isSignedIn, code, router]);

    // Load invite details only after auth check and if user is signed in
  useEffect(() => {
    if (!authChecked || !isSignedIn || !code) return;
    
    console.log('[InvitePage] Loading invite details for code:', code);
    setLoading(true);
    setError(null);
    
    // Add a small delay to ensure authentication is fully established
    const timer = setTimeout(async () => {
      try {
        // Get the auth token for the API call
        const token = await getToken();
        console.log('[InvitePage] Making API call with token:', token ? 'Token available' : 'No token');
        
        // Use the correct public endpoint for invite link details
        console.log('[InvitePage] Using public endpoint for invite link');
        const response = await fetch(`${API_BASE_URL}/api/invite/${code}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.log('[InvitePage] API error response:', errorText);
          if (response.status === 404) throw new Error("This invite link has expired or is no longer active.");
          throw new Error("Failed to load invite details.");
        }
        
        console.log('[InvitePage] API response status:', response.status);
        console.log('[InvitePage] API response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          const errorText = await response.text();
          console.log('[InvitePage] API error response:', errorText);
          if (response.status === 404) throw new Error("This invite link has expired or is no longer active.");
          throw new Error("Failed to load invite details.");
        }
        
        const data = await response.json();
        console.log('[InvitePage] Invite data received:', data);
        setInvite(data);
      } catch (err: any) {
        console.error('[InvitePage] Error loading invite:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 1000); // 1 second delay
    
    return () => clearTimeout(timer);
  }, [authChecked, isSignedIn, code, getToken]);

  // Clear stored invite code when successfully joining
  useEffect(() => {
    if (joined) {
      console.log('[InvitePage] Clearing stored invite code after successful join');
      sessionStorage.removeItem('pendingInviteCode');
    }
  }, [joined]);

  const handleJoin = async () => {
    setJoining(true);
    setError(null);
    console.log('[InvitePage] handleJoin: Attempting to join carpool with code:', code);
    try {
      const token = await getToken();
      console.log('[InvitePage] handleJoin: Got token:', !!token);
      const res = await fetch(`${API_BASE_URL}/api/invite/${code}/join`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('[InvitePage] handleJoin: API response status:', res.status);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error('[InvitePage] handleJoin: Error response:', data);
        throw new Error(data.message || "Failed to join carpool.");
      }
      setJoined(true);
      console.log('[InvitePage] handleJoin: Successfully joined carpool, waiting 2 seconds before redirect...');
      setTimeout(() => {
        console.log('[InvitePage] handleJoin: Redirecting to /dashboard after delay');
        router.push("/dashboard");
        // Force a reload after navigation to ensure fresh data for onboarding check
        setTimeout(() => {
          console.log('[InvitePage] handleJoin: Force reloading page to ensure fresh data');
          window.location.reload();
        }, 1000);
      }, 2000);
    } catch (err: any) {
      console.error('[InvitePage] handleJoin: Exception:', err);
      setError(err.message);
    } finally {
      setJoining(false);
    }
  };

  // Show loading while checking authentication
  if (!authChecked) {
    return (
      <div className="max-w-lg mx-auto mt-16 p-6 bg-white rounded-lg shadow">
        <div className="text-center text-gray-500">Checking authentication...</div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-16 p-6 bg-white rounded-lg shadow">
      {loading ? (
        <div className="text-center text-gray-500">Loading invite details...</div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : invite ? (
        <>
          <h1 className="text-2xl font-bold mb-2">Join Carpool: {invite.carpool_name}</h1>
          <div className="mb-4 text-gray-700">
            <div><b>Invited by:</b> {invite.creator_name}</div>
            <div><b>Expires:</b> {invite.expires_at ? new Date(invite.expires_at).toLocaleString() : "Never"}</div>
            <div><b>Status:</b> {invite.is_active ? "Active" : "Inactive/Expired"}</div>
          </div>
          {joined ? (
            <div className="text-green-600 font-semibold">Successfully joined! Redirecting...</div>
          ) : (
            <Button onClick={handleJoin} disabled={joining} className="w-full">
              {joining ? "Joining..." : "Join Carpool"}
            </Button>
          )}
        </>
      ) : null}
    </div>
  );
} 