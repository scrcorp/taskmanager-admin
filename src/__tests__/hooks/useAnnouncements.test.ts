import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import {
  useAnnouncements,
  useAnnouncement,
  useCreateAnnouncement,
  useUpdateAnnouncement,
  useDeleteAnnouncement,
} from "@/hooks/useAnnouncements";
import type { Announcement, PaginatedResponse } from "@/types";

vi.mock("@/lib/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
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

const mockAnn: Announcement = {
  id: "ann1", title: "Notice", content: "Test content",
  store_id: null, store_name: null, created_by_name: "Admin",
  created_at: "2026-02-01T00:00:00Z",
};

describe("useAnnouncements hooks", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fetches paginated announcements", async () => {
    const { default: api } = await import("@/lib/api");
    const paginated: PaginatedResponse<Announcement> = {
      items: [mockAnn], total: 1, page: 1, per_page: 20,
    };
    vi.mocked(api.get).mockResolvedValueOnce({ data: paginated });

    const { result } = renderHook(() => useAnnouncements(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.items).toHaveLength(1);
    expect(api.get).toHaveBeenCalledWith("/admin/announcements", {
      params: { page: 1, per_page: 20 },
    });
  });

  it("fetches single announcement", async () => {
    const { default: api } = await import("@/lib/api");
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockAnn });

    const { result } = renderHook(() => useAnnouncement("ann1"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.title).toBe("Notice");
    expect(api.get).toHaveBeenCalledWith("/admin/announcements/ann1");
  });

  it("creates an announcement", async () => {
    const { default: api } = await import("@/lib/api");
    vi.mocked(api.post).mockResolvedValueOnce({ data: mockAnn });

    const { result } = renderHook(() => useCreateAnnouncement(), { wrapper: createWrapper() });
    result.current.mutate({ title: "Notice", content: "Test content" });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.post).toHaveBeenCalledWith("/admin/announcements", {
      title: "Notice", content: "Test content",
    });
  });

  it("updates an announcement", async () => {
    const { default: api } = await import("@/lib/api");
    const updated = { ...mockAnn, title: "Updated Notice" };
    vi.mocked(api.put).mockResolvedValueOnce({ data: updated });

    const { result } = renderHook(() => useUpdateAnnouncement(), { wrapper: createWrapper() });
    result.current.mutate({ id: "ann1", title: "Updated Notice" });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.put).toHaveBeenCalledWith("/admin/announcements/ann1", { title: "Updated Notice" });
  });

  it("deletes an announcement", async () => {
    const { default: api } = await import("@/lib/api");
    vi.mocked(api.delete).mockResolvedValueOnce({});

    const { result } = renderHook(() => useDeleteAnnouncement(), { wrapper: createWrapper() });
    result.current.mutate("ann1");
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.delete).toHaveBeenCalledWith("/admin/announcements/ann1");
  });
});
