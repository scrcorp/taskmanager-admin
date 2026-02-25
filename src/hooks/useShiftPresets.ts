/**
 * Shift Preset React Query hooks.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { ShiftPreset } from "@/types";

export function useShiftPresets(storeId: string) {
  return useQuery<ShiftPreset[]>({
    queryKey: ["shiftPresets", storeId],
    queryFn: () => api.get(`/admin/stores/${storeId}/shift-presets`).then((r) => r.data),
    enabled: !!storeId,
  });
}

export function useCreateShiftPreset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { storeId: string; shift_id: string; name: string; start_time: string; end_time: string; sort_order?: number }) =>
      api.post(`/admin/stores/${data.storeId}/shift-presets`, {
        shift_id: data.shift_id,
        name: data.name,
        start_time: data.start_time,
        end_time: data.end_time,
        sort_order: data.sort_order ?? 0,
      }).then((r) => r.data),
    onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: ["shiftPresets", v.storeId] }); },
  });
}

export function useUpdateShiftPreset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; storeId: string; name?: string; start_time?: string; end_time?: string; is_active?: boolean; sort_order?: number }) =>
      api.put(`/admin/shift-presets/${data.id}`, {
        name: data.name,
        start_time: data.start_time,
        end_time: data.end_time,
        is_active: data.is_active,
        sort_order: data.sort_order,
      }).then((r) => r.data),
    onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: ["shiftPresets", v.storeId] }); },
  });
}

export function useDeleteShiftPreset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; storeId: string }) =>
      api.delete(`/admin/shift-presets/${data.id}`),
    onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: ["shiftPresets", v.storeId] }); },
  });
}
