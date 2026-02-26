import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAuthStore } from "@/stores/authStore";

// Mock api module
vi.mock("@/lib/api", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

// Mock window.location
const mockLocation = { href: "" };
Object.defineProperty(globalThis, "window", {
  value: { location: mockLocation, localStorage: globalThis.localStorage },
  writable: true,
});

describe("authStore", () => {
  beforeEach(() => {
    // Reset store state
    useAuthStore.setState({ user: null, isLoading: false });
    mockLocation.href = "";
    vi.clearAllMocks();
  });

  it("has correct initial state", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isLoading).toBe(false);
  });

  it("login sets user after successful call", async () => {
    const { default: api } = await import("@/lib/api");
    const mockUser = {
      id: "1",
      username: "admin",
      full_name: "Admin User",
      email: null,
      phone: null,
      role_name: "admin",
      role_priority: 1,
      organization_id: "org1",
      organization_name: "Test Org",
      company_code: "TEST01",
      is_active: true,
    };

    vi.mocked(api.post).mockResolvedValueOnce({
      data: { access_token: "tok", refresh_token: "ref", token_type: "bearer" },
    });
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockUser });

    await useAuthStore.getState().login("admin", "pass");

    const state = useAuthStore.getState();
    expect(state.user?.username).toBe("admin");
    expect(state.isLoading).toBe(false);
  });

  it("login throws on API error", async () => {
    const { default: api } = await import("@/lib/api");
    vi.mocked(api.post).mockRejectedValueOnce(new Error("401"));

    await expect(useAuthStore.getState().login("bad", "pass")).rejects.toThrow();
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it("logout clears user and tokens", () => {
    useAuthStore.setState({
      user: { id: "1", username: "a" } as any,
    });

    useAuthStore.getState().logout();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it("fetchMe updates user on success", async () => {
    const { default: api } = await import("@/lib/api");
    const mockUser = {
      id: "1",
      username: "admin",
      full_name: "Admin",
      role_name: "admin",
      role_priority: 1,
    };
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockUser });

    await useAuthStore.getState().fetchMe();
    expect(useAuthStore.getState().user?.username).toBe("admin");
  });

  it("fetchMe clears user on failure", async () => {
    const { default: api } = await import("@/lib/api");
    useAuthStore.setState({ user: { id: "1" } as any });
    vi.mocked(api.get).mockRejectedValueOnce(new Error("401"));

    await useAuthStore.getState().fetchMe();
    expect(useAuthStore.getState().user).toBeNull();
  });
});
