import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import api from "@/lib/api";
import type {
  ChecklistInstance,
  ChecklistInstanceComment,
  ChecklistInstanceFilters,
  PaginatedResponse,
} from "@/types";

/**
 * 체크리스트 인스턴스 목록 조회 훅 -- 필터와 페이지네이션을 지원하는 인스턴스 목록을 가져옵니다.
 *
 * Custom hook to fetch paginated checklist instances with optional filters.
 *
 * @param filters - 선택적 필터 (Optional filters for store, date, status, pagination)
 * @returns 체크리스트 인스턴스 목록 쿼리 결과 (Checklist instance list query result)
 */
export const useChecklistInstances = (
  filters: ChecklistInstanceFilters = {},
): UseQueryResult<PaginatedResponse<ChecklistInstance>, Error> => {
  const params: Record<string, string | number> = {};
  if (filters.store_id) params.store_id = filters.store_id;
  if (filters.work_date) params.work_date = filters.work_date;
  if (filters.status) params.status = filters.status;
  if (filters.page) params.page = filters.page;
  if (filters.per_page) params.per_page = filters.per_page;

  return useQuery<PaginatedResponse<ChecklistInstance>, Error>({
    queryKey: ["checklist-instances", params],
    queryFn: async (): Promise<PaginatedResponse<ChecklistInstance>> => {
      const response: AxiosResponse<PaginatedResponse<ChecklistInstance>> =
        await api.get("/admin/checklist-instances", { params });
      return response.data;
    },
  });
};

/**
 * 체크리스트 인스턴스 상세 조회 훅 -- 특정 인스턴스의 상세 정보를 가져옵니다.
 *
 * Custom hook to fetch a single checklist instance detail (includes completions).
 *
 * @param id - 인스턴스 ID (Instance ID)
 * @returns 체크리스트 인스턴스 상세 쿼리 결과 (Checklist instance detail query result)
 */
export const useChecklistInstance = (
  id: string | undefined,
): UseQueryResult<ChecklistInstance, Error> => {
  return useQuery<ChecklistInstance, Error>({
    queryKey: ["checklist-instances", id],
    queryFn: async (): Promise<ChecklistInstance> => {
      const response: AxiosResponse<ChecklistInstance> = await api.get(
        `/admin/checklist-instances/${id}`,
      );
      return response.data;
    },
    enabled: !!id,
  });
};

/**
 * 체크리스트 인스턴스 코멘트 목록 조회 훅.
 *
 * Custom hook to fetch comments for a checklist instance.
 *
 * @param instanceId - 인스턴스 ID (Instance ID)
 * @returns 코멘트 목록 쿼리 결과 (Comments list query result)
 */
export function useChecklistComments(
  instanceId: string,
): UseQueryResult<ChecklistInstanceComment[], Error> {
  return useQuery<ChecklistInstanceComment[], Error>({
    queryKey: ["checklist-instance-comments", instanceId],
    queryFn: async (): Promise<ChecklistInstanceComment[]> => {
      const response: AxiosResponse<ChecklistInstanceComment[]> = await api.get(
        `/admin/checklist-instances/${instanceId}/comments`,
      );
      return response.data;
    },
    enabled: !!instanceId,
  });
}

/**
 * 체크리스트 인스턴스 코멘트 생성 훅.
 *
 * Custom hook to create a comment on a checklist instance.
 *
 * @returns 코멘트 생성 뮤테이션 결과 (Comment creation mutation result)
 */
export function useCreateChecklistComment(): UseMutationResult<
  ChecklistInstanceComment,
  Error,
  { instanceId: string; text: string }
> {
  const queryClient = useQueryClient();
  return useMutation<
    ChecklistInstanceComment,
    Error,
    { instanceId: string; text: string }
  >({
    mutationFn: async ({
      instanceId,
      text,
    }): Promise<ChecklistInstanceComment> => {
      const response: AxiosResponse<ChecklistInstanceComment> = await api.post(
        `/admin/checklist-instances/${instanceId}/comments`,
        { text },
      );
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["checklist-instance-comments", variables.instanceId],
      });
    },
  });
}
