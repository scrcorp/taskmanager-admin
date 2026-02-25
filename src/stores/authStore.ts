import { create } from "zustand";
import type { UserMe } from "@/types";
import { clearTokens, setTokens, getCompanyCode, getRefreshToken } from "@/lib/auth";
import api from "@/lib/api";

interface AuthState {
  user: UserMe | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,

  login: async (username, password) => {
    set({ isLoading: true });
    try {
      const companyCode = getCompanyCode();
      const res = await api.post("/admin/auth/login", {
        username,
        password,
        ...(companyCode ? { company_code: companyCode } : {}),
      });
      setTokens(res.data.access_token, res.data.refresh_token);
      const me = await api.get("/auth/me");
      set({ user: me.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      api.post("/auth/logout", { refresh_token: refreshToken }).catch(() => {});
    }
    clearTokens();
    set({ user: null });
    window.location.href = "/login";
  },

  fetchMe: async () => {
    try {
      const res = await api.get("/auth/me");
      set({ user: res.data });
    } catch {
      clearTokens();
      set({ user: null });
    }
  },
}));
