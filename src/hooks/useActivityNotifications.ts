"use client"
import { useEffect, useRef } from "react";
import { useToast } from "@/components/ui/toast";
import { addInviteAcceptedNotification } from "@/components/NotificationPopup";
import { useUser, useAuth } from "@clerk/nextjs";

export function useActivityNotifications() {
  const { showToast } = useToast();
  const { user } = useUser();
  const { getToken } = useAuth();
  const lastSeenId = useRef<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    let interval: NodeJS.Timeout;

    const poll = async () => {
      try {
        // Get the authentication token
        const token = await getToken();
        
        // Use the backend API endpoint with proper authentication
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activity?limit=10`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!res.ok) {
          console.error('Activity API Error:', res.status, res.statusText);
          return;
        }
        
        const activities = await res.json();
        // Filter for new invite_accepted/invite_rejected activities
        const newActivities = (activities || [])
          .filter((a: any) =>
            (a.type === "invite_accepted" || a.type === "invite_rejected") &&
            (!lastSeenId.current || a.id > lastSeenId.current)
          )
          .sort((a: any, b: any) => (a.id > b.id ? 1 : -1));

        if (newActivities.length > 0) {
          lastSeenId.current = newActivities[newActivities.length - 1].id;
          newActivities.forEach((activity: any) => {
            if (activity.type === "invite_accepted") {
              showToast(`${activity.invitee_name} accepted your invite to ${activity.carpool_name}!`);
              addInviteAcceptedNotification?.(
                user.id,
                activity.invitee_name,
                activity.carpool_name
              );
            }
            if (activity.type === "invite_rejected") {
              showToast(`${activity.invitee_name} rejected your invite to ${activity.carpool_name}.`);
              // Optionally add a notification popup for rejected as well
            }
          });
        }
      } catch (e) {
        console.error('Activity notifications error:', e);
        // Optionally handle errors
      }
    };

    poll();
    interval = setInterval(poll, 15000); // Poll every 15 seconds

    return () => clearInterval(interval);
  }, [user?.id, showToast, getToken]);
} 