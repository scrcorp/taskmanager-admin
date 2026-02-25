/**
 * Labor Law Setting React Query hooks.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { LaborLawSetting } from "@/types";

export function useLaborLaw(storeId: string) {
  return useQuery<LaborLawSetting | null>({
    queryKey: ["laborLaw", storeId],
    queryFn: () => api.get(`/admin/stores/${storeId}/labor-law`).then((r) => r.data),
    enabled: !!storeId,
  });
}

export function useUpsertLaborLaw() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { storeId: string; federal_max_weekly: number; state_max_weekly?: number | null; store_max_weekly?: number | null; overtime_threshold_daily?: number | null }) =>
      api.put(`/admin/stores/${data.storeId}/labor-law`, {
        federal_max_weekly: data.federal_max_weekly,
        state_max_weekly: data.state_max_weekly ?? null,
        store_max_weekly: data.store_max_weekly ?? null,
        overtime_threshold_daily: data.overtime_threshold_daily ?? null,
      }).then((r) => r.data),
    onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: ["laborLaw", v.storeId] }); },
  });
}
