"use client";

/**
 * Schedule Settings 페이지 — 목업 리디자인 이관.
 * Work Hour Alerts, Weekly Limits, Approval, Break Rules, Work Roles 등.
 */

import { useRouter } from "next/navigation";
import { ScheduleSettings } from "@/components/schedules/redesign/ScheduleSettings";

export default function ScheduleSettingsPage() {
  const router = useRouter();
  return <ScheduleSettings showLabor={true} onBack={() => router.push("/schedules")} />;
}
