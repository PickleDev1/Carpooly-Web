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

  const code = params.code as string;

  useEffect(() => {
    if (!code) return;
    setLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/api/invite/${code}`)
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 404) throw new Error("This invite link has expired or is no longer active.");
          throw new Error("Failed to load invite details.");
        }
        return res.json();
      })
      .then(setInvite)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [code]);

  // If not signed in, redirect to sign in with return URL
  useEffect(() => {
    if (!loading && !isSignedIn) {
      // Clerk sign-in page with redirect back to this invite
      router.push(`/sign-up?redirect_url=/invite/${code}`);
    }
  }, [loading, isSignedIn, code, router]);

  const handleJoin = async () => {
    setJoining(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/api/invite/${code}/join`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to join carpool.");
      }
      setJoined(true);
      setTimeout(() => router.push("/carpools/list"), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setJoining(false);
    }
  };

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