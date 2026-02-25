import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole } from "@/hooks/useRoles";
import type { Role } from "@/types";

vi.mock("@/lib/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockRoles: Role[] = [
  { id: "r1", name: "Admin", level: 1, created_at: "2026-01-01T00:00:00Z" },
  { id: "r2", name: "Manager", level: 2, created_at: "2026-01-02T00:00:00Z" },
];

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children);
}

describe("useRoles hooks", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fetches roles", async () => {
    const { default: api } = await import("@/lib/api");
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockRoles });

    const { result } = renderHook(() => useRoles(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(2);
    expect(api.get).toHaveBeenCalledWith("/admin/roles");
  });

  it("creates a role", async () => {
    const { default: api } = await import("@/lib/api");
    const newRole: Role = { id: "r3", name: "Staff", level: 3, created_at: "2026-02-01T00:00:00Z" };
    vi.mocked(api.post).mockResolvedValueOnce({ data: newRole });

    const { result } = renderHook(() => useCreateRole(), { wrapper: createWrapper() });
    result.current.mutate({ name: "Staff", level: 3 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.name).toBe("Staff");
    expect(api.post).toHaveBeenCalledWith("/admin/roles", { name: "Staff", level: 3 });
  });

  it("updates a role", async () => {
    const { default: api } = await import("@/lib/api");
    const updated: Role = { id: "r1", name: "Super Admin", level: 0, created_at: "2026-01-01T00:00:00Z" };
    vi.mocked(api.put).mockResolvedValueOnce({ data: updated });

    const { result } = renderHook(() => useUpdateRole(), { wrapper: createWrapper() });
    result.current.mutate({ id: "r1", name: "Super Admin", level: 0 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.name).toBe("Super Admin");
    expect(api.put).toHaveBeenCalledWith("/admin/roles/r1", { name: "Super Admin", level: 0 });
  });

  it("deletes a role", async () => {
    const { default: api } = await import("@/lib/api");
    vi.mocked(api.delete).mockResolvedValueOnce({});

    const { result } = renderHook(() => useDeleteRole(), { wrapper: createWrapper() });
    result.current.mutate("r2");
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.delete).toHaveBeenCalledWith("/admin/roles/r2");
  });
});
