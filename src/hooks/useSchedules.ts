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
  Schedule,
  ScheduleCreate,
  ScheduleUpdate,
  ScheduleFilters,
  PaginatedResponse,
} from "@/types";

/**
 * 스케줄 목록 조회 훅 -- 필터를 적용하여 스케줄 목록을 가져옵니다.
 *
 * Custom hook to fetch paginated schedules with optional filters.
 *
 * @param filters - 선택적 필터 (Optional filters for store, user, date, status, pagination)
 * @returns 스케줄 목록 쿼리 결과 (Schedule list query result)
 */
export const useSchedules = (
  filters: ScheduleFilters = {},
): UseQueryResult<PaginatedResponse<Schedule>, Error> => {
  const params: Record<string, string | number> = {};
  if (filters.store_id) params.store_id = filters.store_id;
  if (filters.user_id) params.user_id = filters.user_id;
  if (filters.work_date) params.work_date = filters.work_date;
  if (filters.date_from) params.date_from = filters.date_from;
  if (filters.date_to) params.date_to = filters.date_to;
  if (filters.status) params.status = filters.status;
  if (filters.page) params.page = filters.page;
  if (filters.per_page) params.per_page = filters.per_page;

  return useQuery<PaginatedResponse<Schedule>, Error>({
    queryKey: ["schedules", params],
    queryFn: async (): Promise<PaginatedResponse<Schedule>> => {
      const response: AxiosResponse<PaginatedResponse<Schedule>> =
        await api.get("/admin/schedules", { params });
      return response.data;
    },
  });
};

/**
 * 스케줄 상세 조회 훅 -- 특정 스케줄의 상세 정보를 가져옵니다.
 *
 * Custom hook to fetch a single schedule detail.
 *
 * @param id - 스케줄 ID (Schedule ID)
 * @returns 스케줄 상세 쿼리 결과 (Schedule detail query result)
 */
export const useSchedule = (
  id: string | undefined,
): UseQueryResult<Schedule, Error> => {
  return useQuery<Schedule, Error>({
    queryKey: ["schedules", id],
    queryFn: async (): Promise<Schedule> => {
      const response: AxiosResponse<Schedule> = await api.get(
        `/admin/schedules/${id}`,
      );
      return response.data;
    },
    enabled: !!id,
  });
};

/**
 * 스케줄 생성 훅 -- 새 스케줄 초안을 생성하고 목록을 갱신합니다.
 *
 * Mutation hook to create a new draft schedule and invalidate the list.
 *
 * @returns 스케줄 생성 뮤테이션 결과 (Schedule creation mutation result)
 */
export const useCreateSchedule = (): UseMutationResult<
  Schedule,
  Error,
  ScheduleCreate
> => {
  const queryClient: QueryClient = useQueryClient();
  return useMutation<Schedule, Error, ScheduleCreate>({
    mutationFn: async (data: ScheduleCreate): Promise<Schedule> => {
      const response: AxiosResponse<Schedule> = await api.post(
        "/admin/schedules",
        data,
      );
      return response.data;
    },
    onSuccess: (): void => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });
};

/**
 * 스케줄 수정 훅 -- 기존 스케줄을 수정하고 목록을 갱신합니다.
 *
 * Mutation hook to update a schedule and invalidate related queries.
 *
 * @returns 스케줄 수정 뮤테이션 결과 (Schedule update mutation result)
 */
export const useUpdateSchedule = (): UseMutationResult<
  Schedule,
  Error,
  { id: string; data: ScheduleUpdate }
> => {
  const queryClient: QueryClient = useQueryClient();
  return useMutation<Schedule, Error, { id: string; data: ScheduleUpdate }>({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: ScheduleUpdate;
    }): Promise<Schedule> => {
      const response: AxiosResponse<Schedule> = await api.patch(
        `/admin/schedules/${id}`,
        data,
      );
      return response.data;
    },
    onSuccess: (_: Schedule, variables): void => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({
        queryKey: ["schedules", variables.id],
      });
    },
  });
};

/**
 * 스케줄 승인 요청 훅 -- draft → pending 상태 변경.
 *
 * Mutation hook to submit a schedule for approval (draft -> pending).
 *
 * @returns 승인 요청 뮤테이션 결과 (Submit mutation result)
 */
export const useSubmitSchedule = (): UseMutationResult<
  Schedule,
  Error,
  string
> => {
  const queryClient: QueryClient = useQueryClient();
  return useMutation<Schedule, Error, string>({
    mutationFn: async (id: string): Promise<Schedule> => {
      const response: AxiosResponse<Schedule> = await api.post(
        `/admin/schedules/${id}/submit`,
      );
      return response.data;
    },
    onSuccess: (_: Schedule, id: string): void => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({ queryKey: ["schedules", id] });
    },
  });
};

/**
 * 스케줄 승인 훅 -- pending → approved 상태 변경 + work_assignment 자동 생성.
 *
 * Mutation hook to approve a schedule (pending -> approved, auto-creates work_assignment).
 *
 * @returns 승인 뮤테이션 결과 (Approve mutation result)
 */
export const useApproveSchedule = (): UseMutationResult<
  Schedule,
  Error,
  string
> => {
  const queryClient: QueryClient = useQueryClient();
  return useMutation<Schedule, Error, string>({
    mutationFn: async (id: string): Promise<Schedule> => {
      const response: AxiosResponse<Schedule> = await api.post(
        `/admin/schedules/${id}/approve`,
      );
      return response.data;
    },
    onSuccess: (_: Schedule, id: string): void => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({ queryKey: ["schedules", id] });
      // 배정 목록도 갱신 — Also invalidate assignments since a new one was created
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
    },
  });
};

/**
 * 스케줄 취소 훅 -- draft/pending → cancelled 상태 변경.
 *
 * Mutation hook to cancel a schedule (draft/pending -> cancelled).
 *
 * @returns 취소 뮤테이션 결과 (Cancel mutation result)
 */
export const useCancelSchedule = (): UseMutationResult<
  void,
  Error,
  string
> => {
  const queryClient: QueryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id: string): Promise<void> => {
      await api.post(`/admin/schedules/${id}/cancel`);
    },
    onSuccess: (_: void, id: string): void => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({ queryKey: ["schedules", id] });
    },
  });
};

/**
 * 대리 근무자 지정 훅 -- 스케줄의 담당자를 다른 사용자로 변경합니다.
 *
 * Mutation hook to substitute the assigned user on a schedule.
 *
 * @returns 대리 근무 뮤테이션 결과 (Substitute mutation result)
 */
export const useSubstituteSchedule = (): UseMutationResult<
  Schedule,
  Error,
  { id: string; new_user_id: string }
> => {
  const queryClient: QueryClient = useQueryClient();
  return useMutation<Schedule, Error, { id: string; new_user_id: string }>({
    mutationFn: async ({
      id,
      new_user_id,
    }: {
      id: string;
      new_user_id: string;
    }): Promise<Schedule> => {
      const response: AxiosResponse<Schedule> = await api.patch(
        `/admin/schedules/${id}/substitute`,
        { new_user_id },
      );
      return response.data;
    },
    onSuccess: (_: Schedule, variables): void => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({
        queryKey: ["schedules", variables.id],
      });
    },
  });
};

/** 초과근무 검증 요청 데이터 타입 (Overtime validation request data type) */
interface ValidateOvertimeData {
  user_id: string;
  work_date: string;
  hours: number;
}

/** 초과근무 검증 응답 타입 (Overtime validation response type) */
interface ValidateOvertimeResult {
  is_overtime: boolean;
  total_hours: number;
  weekly_limit: number;
  message: string;
}

/**
 * 초과근무 검증 훅 -- 특정 사용자의 초과근무 여부를 확인합니다.
 *
 * Mutation hook to validate whether assigning hours to a user on a given date
 * would exceed overtime limits.
 *
 * @returns 초과근무 검증 뮤테이션 결과 (Overtime validation mutation result)
 */
export const useValidateOvertime = (): UseMutationResult<
  ValidateOvertimeResult,
  Error,
  ValidateOvertimeData
> => {
  return useMutation<ValidateOvertimeResult, Error, ValidateOvertimeData>({
    mutationFn: async (
      data: ValidateOvertimeData,
    ): Promise<ValidateOvertimeResult> => {
      const response: AxiosResponse<ValidateOvertimeResult> = await api.post(
        "/admin/schedules/validate-overtime",
        data,
      );
      return response.data;
    },
  });
};
