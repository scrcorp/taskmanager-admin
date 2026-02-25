/**
 * Dashboard React Query hooks.
 */

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { ChecklistCompletion, AttendanceSummary, OvertimeSummary, EvaluationSummary } from "@/types";

function buildParams(params: Record<string, string | undefined | null>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) sp.set(k, v);
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export function useChecklistCompletion(dateFrom?: string, dateTo?: string, storeId?: string) {
  return useQuery<ChecklistCompletion>({
    queryKey: ["dashboard", "checklist-completion", dateFrom, dateTo, storeId],
    queryFn: () =>
      api.get(`/admin/dashboard/checklist-completion${buildParams({ date_from: dateFrom, date_to: dateTo, store_id: storeId })}`).then((r) => r.data),
  });
}

export function useAttendanceSummary(dateFrom?: string, dateTo?: string, storeId?: string) {
  return useQuery<AttendanceSummary>({
    queryKey: ["dashboard", "attendance-summary", dateFrom, dateTo, storeId],
    queryFn: () =>
      api.get(`/admin/dashboard/attendance-summary${buildParams({ date_from: dateFrom, date_to: dateTo, store_id: storeId })}`).then((r) => r.data),
  });
}

export function useOvertimeSummary(weekDate?: string, storeId?: string) {
  return useQuery<OvertimeSummary>({
    queryKey: ["dashboard", "overtime-summary", weekDate, storeId],
    queryFn: () =>
      api.get(`/admin/dashboard/overtime-summary${buildParams({ week_date: weekDate, store_id: storeId })}`).then((r) => r.data),
  });
}

export function useEvaluationSummary() {
  return useQuery<EvaluationSummary>({
    queryKey: ["dashboard", "evaluation-summary"],
    queryFn: () =>
      api.get("/admin/dashboard/evaluation-summary").then((r) => r.data),
  });
}
