import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
  type QueryClient,
} from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import api from "@/lib/api";
import type {
  Assignment,
  AssignmentDetail,
  PaginatedResponse,
} from "@/types";

/** 업무 배정 목록 필터 타입 (Assignment list filter type) */
interface AssignmentFilters {
  store_id?: string;
  user_id?: string;
  work_date?: string;
  date_from?: string;
  date_to?: string;
  status?: "assigned" | "in_progress" | "completed";
  page?: number;
  per_page?: number;
}

/**
 * 업무 배정 목록 조회 훅 -- 필터를 적용하여 업무 배정 목록을 가져옵니다.
 *
 * Custom hook to fetch paginated work assignments with optional filters.
 *
 * @param filters - 선택적 필터 (Optional filters for store, user, date, status, pagination)
 * @returns 업무 배정 목록 쿼리 결과 (Assignment list query result)
 */
export const useAssignments = (
  filters: AssignmentFilters = {},
): UseQueryResult<PaginatedResponse<Assignment>, Error> => {
  const params: Record<string, string | number> = {};
  if (filters.store_id) params.store_id = filters.store_id;
  if (filters.user_id) params.user_id = filters.user_id;
  if (filters.work_date) params.work_date = filters.work_date;
  if (filters.date_from) params.date_from = filters.date_from;
  if (filters.date_to) params.date_to = filters.date_to;
  if (filters.status) params.status = filters.status;
  if (filters.page) params.page = filters.page;
  if (filters.per_page) params.per_page = filters.per_page;

  return useQuery<PaginatedResponse<Assignment>, Error>({
    queryKey: ["assignments", params],
    queryFn: async (): Promise<PaginatedResponse<Assignment>> => {
      const response: AxiosResponse<PaginatedResponse<Assignment>> =
        await api.get("/admin/work-assignments", { params });
      return response.data;
    },
  });
};

/**
 * 업무 배정 상세 조회 훅 -- 특정 업무 배정의 상세 정보를 가져옵니다.
 *
 * Custom hook to fetch a single assignment detail (includes checklist snapshot).
 *
 * @param id - 배정 ID (Assignment ID)
 * @returns 업무 배정 상세 쿼리 결과 (Assignment detail query result)
 */
export const useAssignment = (
  id: string | undefined,
): UseQueryResult<AssignmentDetail, Error> => {
  return useQuery<AssignmentDetail, Error>({
    queryKey: ["assignments", id],
    queryFn: async (): Promise<AssignmentDetail> => {
      const response: AxiosResponse<AssignmentDetail> = await api.get(
        `/admin/work-assignments/${id}`,
      );
      return response.data;
    },
    enabled: !!id,
  });
};

/** 최근 배정 사용자 항목 (Recent assignment user entry) */
export interface RecentAssignmentUser {
  shift_id: string;
  position_id: string;
  user_id: string;
  last_work_date: string;
}

/**
 * 매장 내 최근 배정 사용자 조회 훅 -- shift×position 조합별 최근 배정 이력.
 *
 * Custom hook to fetch recently assigned user IDs per shift×position combo.
 *
 * @param storeId - 매장 ID (Store ID)
 * @param excludeDate - 제외할 날짜, 보통 오늘 (Date to exclude, usually today)
 * @returns 최근 배정 사용자 목록 쿼리 결과 (Recent assignment users query result)
 */
export const useRecentAssignmentUsers = (
  storeId: string | undefined,
  excludeDate?: string,
): UseQueryResult<RecentAssignmentUser[], Error> => {
  return useQuery<RecentAssignmentUser[], Error>({
    queryKey: ["assignments", "recent-users", storeId, excludeDate],
    queryFn: async (): Promise<RecentAssignmentUser[]> => {
      const params: Record<string, string> = { store_id: storeId! };
      if (excludeDate) params.exclude_date = excludeDate;
      const response: AxiosResponse<{ items: RecentAssignmentUser[] }> =
        await api.get("/admin/work-assignments/recent-users", { params });
      return response.data.items;
    },
    enabled: !!storeId,
  });
};

/** 업무 배정 생성 요청 데이터 타입 (Assignment creation request data type) */
interface CreateAssignmentData {
  store_id: string;
  shift_id: string;
  position_id: string;
  user_id: string;
  work_date: string;
}

/**
 * 업무 배정 생성 훅 -- 새 업무 배정을 생성하고 목록을 갱신합니다.
 *
 * Mutation hook to create a new work assignment and invalidate the list.
 *
 * @returns 업무 배정 생성 뮤테이션 결과 (Assignment creation mutation result)
 */
export const useCreateAssignment = (): UseMutationResult<
  Assignment,
  Error,
  CreateAssignmentData
> => {
  const queryClient: QueryClient = useQueryClient();
  return useMutation<Assignment, Error, CreateAssignmentData>({
    mutationFn: async (data: CreateAssignmentData): Promise<Assignment> => {
      const response: AxiosResponse<Assignment> = await api.post(
        "/admin/work-assignments",
        data,
      );
      return response.data;
    },
    onSuccess: (newAssignment: Assignment): void => {
      queryClient.setQueriesData<PaginatedResponse<Assignment>>(
        { queryKey: ["assignments"] },
        (old) => {
          if (!old || !Array.isArray(old?.items)) return old;
          return { ...old, items: [newAssignment, ...old.items], total: old.total + 1 };
        },
      );
    },
  });
};

/** 대량 배정 생성 요청 데이터 타입 (Bulk assignment creation request data type) */
interface BulkCreateAssignmentsData {
  store_id: string;
  shift_id: string;
  position_id: string;
  user_ids: string[];
  work_date: string;
}

/**
 * 대량 업무 배정 생성 훅 -- 여러 사용자에게 동시에 작업을 배정합니다.
 *
 * Mutation hook to bulk-create assignments for multiple users.
 *
 * @returns 대량 배정 생성 뮤테이션 결과 (Bulk assignment creation mutation result)
 */
export const useBulkCreateAssignments = (): UseMutationResult<
  Assignment[],
  Error,
  BulkCreateAssignmentsData
> => {
  const queryClient: QueryClient = useQueryClient();
  return useMutation<Assignment[], Error, BulkCreateAssignmentsData>({
    mutationFn: async (
      data: BulkCreateAssignmentsData,
    ): Promise<Assignment[]> => {
      // 서버는 AssignmentCreate[] 형태를 기대 — Transform user_ids into individual objects
      const payload = data.user_ids.map((uid) => ({
        store_id: data.store_id,
        shift_id: data.shift_id,
        position_id: data.position_id,
        user_id: uid,
        work_date: data.work_date,
      }));
      const response: AxiosResponse<Assignment[]> = await api.post(
        "/admin/work-assignments/bulk",
        payload,
      );
      return response.data;
    },
    onSuccess: (newAssignments: Assignment[]): void => {
      queryClient.setQueriesData<PaginatedResponse<Assignment>>(
        { queryKey: ["assignments"] },
        (old) => {
          if (!old || !Array.isArray(old?.items)) return old;
          return { ...old, items: [...newAssignments, ...old.items], total: old.total + newAssignments.length };
        },
      );
    },
  });
};

/**
 * 업무 배정 삭제 훅 -- 배정을 삭제하고 목록을 갱신합니다.
 *
 * Mutation hook to delete an assignment and invalidate the list.
 *
 * @returns 배정 삭제 뮤테이션 결과 (Assignment deletion mutation result)
 */
export const useDeleteAssignment = (): UseMutationResult<
  void,
  Error,
  string
> => {
  const queryClient: QueryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/admin/work-assignments/${id}`);
    },
    onSuccess: (_: void, id: string): void => {
      queryClient.setQueriesData<PaginatedResponse<Assignment>>(
        { queryKey: ["assignments"] },
        (old) => {
          if (!old || !Array.isArray(old?.items)) return old;
          return { ...old, items: old.items.filter((a) => a.id !== id), total: old.total - 1 };
        },
      );
    },
  });
};
