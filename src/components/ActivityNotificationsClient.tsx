"use client";
import { useActivityNotifications } from "@/hooks/useActivityNotifications";

export function ActivityNotificationsClient() {
  useActivityNotifications();
  return null;
} 