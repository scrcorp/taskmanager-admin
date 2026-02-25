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
  EvalTemplate,
  EvalTemplateCreate,
  Evaluation,
  EvaluationCreate,
  EvaluationFilters,
  PaginatedResponse,
} from "@/types";

// === 템플릿 Hooks ===

export const useEvalTemplates = (
  page: number = 1,
  perPage: number = 20
): UseQueryResult<PaginatedResponse<EvalTemplate>, Error> => {
  return useQuery({
    queryKey: ["eval-templates", page, perPage],
    queryFn: async () => {
      const res: AxiosResponse<PaginatedResponse<EvalTemplate>> = await api.get(
        "/admin/evaluations/templates",
        { params: { page, per_page: perPage } }
      );
      return res.data;
    },
  });
};

export const useEvalTemplate = (
  templateId: string
): UseQueryResult<EvalTemplate, Error> => {
  return useQuery({
    queryKey: ["eval-template", templateId],
    queryFn: async () => {
      const res: AxiosResponse<EvalTemplate> = await api.get(
        `/admin/evaluations/templates/${templateId}`
      );
      return res.data;
    },
    enabled: !!templateId,
  });
};

export const useCreateEvalTemplate = (): UseMutationResult<
  EvalTemplate,
  Error,
  EvalTemplateCreate
> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: EvalTemplateCreate) => {
      const res: AxiosResponse<EvalTemplate> = await api.post(
        "/admin/evaluations/templates",
        data
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["eval-templates"] });
    },
  });
};

export const useDeleteEvalTemplate = (): UseMutationResult<
  void,
  Error,
  string
> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (templateId: string) => {
      await api.delete(`/admin/evaluations/templates/${templateId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["eval-templates"] });
    },
  });
};

// === 평가 Hooks ===

export const useEvaluations = (
  filters: EvaluationFilters = {}
): UseQueryResult<PaginatedResponse<Evaluation>, Error> => {
  return useQuery({
    queryKey: ["evaluations", filters],
    queryFn: async () => {
      const res: AxiosResponse<PaginatedResponse<Evaluation>> = await api.get(
        "/admin/evaluations",
        { params: filters }
      );
      return res.data;
    },
  });
};

export const useEvaluation = (
  evaluationId: string
): UseQueryResult<Evaluation, Error> => {
  return useQuery({
    queryKey: ["evaluation", evaluationId],
    queryFn: async () => {
      const res: AxiosResponse<Evaluation> = await api.get(
        `/admin/evaluations/${evaluationId}`
      );
      return res.data;
    },
    enabled: !!evaluationId,
  });
};

export const useCreateEvaluation = (): UseMutationResult<
  Evaluation,
  Error,
  EvaluationCreate
> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: EvaluationCreate) => {
      const res: AxiosResponse<Evaluation> = await api.post(
        "/admin/evaluations",
        data
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["evaluations"] });
    },
  });
};

export const useSubmitEvaluation = (): UseMutationResult<
  Evaluation,
  Error,
  string
> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (evaluationId: string) => {
      const res: AxiosResponse<Evaluation> = await api.post(
        `/admin/evaluations/${evaluationId}/submit`
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["evaluations"] });
    },
  });
};
