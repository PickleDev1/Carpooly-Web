"use client";

import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url");
  const { isSignedIn, getToken } = useAuth();
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // Handle post-sign-up user creation and onboarding redirect
  useEffect(() => {
    const handlePostSignUp = async () => {
      if (!isSignedIn || !user?.id || !isLoaded) return;

      try {
        console.log("🔄 Post-sign-up: Creating user in backend...");
        
        // Create user in backend
        const token = await getToken();
        const response = await fetch("/api/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          console.error("Failed to create user in backend:", response.status);
          // Even if user creation fails, redirect to onboarding
          // The onboarding page will handle the user creation if needed
        } else {
          console.log("✅ User created successfully in backend");
        }

        // Check if there's a specific redirect URL (e.g., for invites)
        if (redirectUrl) {
          console.log("🔄 Post-sign-up: Redirecting to:", redirectUrl);
          router.push(redirectUrl);
        } else {
          // For new users, redirect to onboarding
          console.log("🔄 Post-sign-up: Redirecting to onboarding");
          router.push("/onboarding");
        }
      } catch (error) {
        console.error("Error in post-sign-up flow:", error);
        // Fallback: redirect to onboarding
        router.push("/onboarding");
      }
    };

    // Only run this effect once after sign-up is complete
    if (isSignedIn && user?.id && isLoaded) {
      handlePostSignUp();
    }
  }, [isSignedIn, user?.id, isLoaded, redirectUrl, router, getToken]);

  return (
    <SignUp 
      afterSignUpUrl={redirectUrl || "/onboarding"}
      redirectUrl={redirectUrl || "/onboarding"}
    />
  );
}