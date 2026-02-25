import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import {
  useAssignments,
  useAssignment,
  useCreateAssignment,
  useBulkCreateAssignments,
  useDeleteAssignment,
} from "@/hooks/useAssignments";
import type { Assignment, AssignmentDetail, PaginatedResponse } from "@/types";

vi.mock("@/lib/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children);
}

const mockAssignment: Assignment = {
  id: "a1", store_id: "b1", store_name: "Store A",
  shift_id: "s1", shift_name: "Morning", shift_sort_order: 1,
  position_id: "p1", position_name: "Cashier",
  user_id: "u1", user_name: "Staff",
  work_date: "2026-02-01", status: "assigned",
  total_items: 5, completed_items: 0,
  created_at: "2026-02-01T00:00:00Z",
};

const mockPaginated: PaginatedResponse<Assignment> = {
  items: [mockAssignment], total: 1, page: 1, per_page: 20,
};

describe("useAssignments hooks", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fetches paginated assignments", async () => {
    const { default: api } = await import("@/lib/api");
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockPaginated });

    const { result } = renderHook(() => useAssignments(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.items).toHaveLength(1);
    expect(api.get).toHaveBeenCalledWith("/admin/work-assignments", { params: {} });
  });

  it("fetches assignments with filters", async () => {
    const { default: api } = await import("@/lib/api");
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockPaginated });

    const { result } = renderHook(
      () => useAssignments({ store_id: "b1", work_date: "2026-02-01" }),
      { wrapper: createWrapper() },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.get).toHaveBeenCalledWith("/admin/work-assignments", {
      params: { store_id: "b1", work_date: "2026-02-01" },
    });
  });

  it("fetches single assignment detail", async () => {
    const { default: api } = await import("@/lib/api");
    const detail: AssignmentDetail = { ...mockAssignment, checklist_snapshot: null };
    vi.mocked(api.get).mockResolvedValueOnce({ data: detail });

    const { result } = renderHook(() => useAssignment("a1"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.id).toBe("a1");
    expect(api.get).toHaveBeenCalledWith("/admin/work-assignments/a1");
  });

  it("creates an assignment", async () => {
    const { default: api } = await import("@/lib/api");
    vi.mocked(api.post).mockResolvedValueOnce({ data: mockAssignment });

    const { result } = renderHook(() => useCreateAssignment(), { wrapper: createWrapper() });
    result.current.mutate({
      store_id: "b1", shift_id: "s1", position_id: "p1",
      user_id: "u1", work_date: "2026-02-01",
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.post).toHaveBeenCalledWith("/admin/work-assignments", {
      store_id: "b1", shift_id: "s1", position_id: "p1",
      user_id: "u1", work_date: "2026-02-01",
    });
  });

  it("bulk creates assignments", async () => {
    const { default: api } = await import("@/lib/api");
    vi.mocked(api.post).mockResolvedValueOnce({ data: [mockAssignment] });

    const { result } = renderHook(() => useBulkCreateAssignments(), { wrapper: createWrapper() });
    result.current.mutate({
      store_id: "b1", shift_id: "s1", position_id: "p1",
      user_ids: ["u1", "u2"], work_date: "2026-02-01",
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.post).toHaveBeenCalledWith("/admin/work-assignments/bulk", [
      { store_id: "b1", shift_id: "s1", position_id: "p1", user_id: "u1", work_date: "2026-02-01" },
      { store_id: "b1", shift_id: "s1", position_id: "p1", user_id: "u2", work_date: "2026-02-01" },
    ]);
  });

  it("deletes an assignment", async () => {
    const { default: api } = await import("@/lib/api");
    vi.mocked(api.delete).mockResolvedValueOnce({});

    const { result } = renderHook(() => useDeleteAssignment(), { wrapper: createWrapper() });
    result.current.mutate("a1");
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.delete).toHaveBeenCalledWith("/admin/work-assignments/a1");
  });
});
