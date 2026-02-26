/**
 * Overtime Alerts React Query hook.
 */

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export interface OvertimeAlert {
  id: string;
  user_id: string;
  user_name: string;
  total_hours: number;
  max_weekly: number;
  over_hours: number;
  status: string;
}

export function useOvertimeAlerts(storeId: string) {
  return useQuery<OvertimeAlert[]>({
    queryKey: ["overtimeAlerts", storeId],
    queryFn: () => api.get(`/admin/stores/${storeId}/overtime-alerts`).then((r) => r.data),
    enabled: !!storeId,
  });
}
