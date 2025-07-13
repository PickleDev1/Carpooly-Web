"use client"

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

export function SignInRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const { isSignedIn } = useAuth();

  useEffect(() => {
    console.log('[SignInRedirect] Effect triggered - isSignedIn:', isSignedIn, 'pathname:', pathname);
    
    // Check for pending invite code when user is authenticated
    if (isSignedIn) {
      const storedCode = sessionStorage.getItem('pendingInviteCode');
      console.log('[SignInRedirect] Checking for stored invite code:', storedCode);
      
      if (storedCode) {
        console.log('[SignInRedirect] Found stored invite code:', storedCode);
        
        // Don't redirect if we're already on an invite page
        if (pathname.startsWith('/invite/')) {
          console.log('[SignInRedirect] Already on invite page, not redirecting');
          return;
        }
        
        // Clear the stored code and redirect to the invite page
        sessionStorage.removeItem('pendingInviteCode');
        console.log('[SignInRedirect] Redirecting to invite page:', `/invite/${storedCode}`);
        router.push(`/invite/${storedCode}`);
      } else {
        console.log('[SignInRedirect] No stored invite code found');
      }
    } else {
      console.log('[SignInRedirect] User not signed in, skipping invite check');
    }
  }, [isSignedIn, pathname, router]);

  return null; // This component doesn't render anything
} 