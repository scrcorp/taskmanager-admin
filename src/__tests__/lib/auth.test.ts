import { describe, it, expect, beforeEach } from "vitest";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  isAuthenticated,
  getCompanyCode,
  setCompanyCode,
  hasCompanyCode,
} from "@/lib/auth";

describe("auth utilities", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("token management", () => {
    it("returns null when no token exists", () => {
      expect(getAccessToken()).toBeNull();
      expect(getRefreshToken()).toBeNull();
    });

    it("stores and retrieves tokens", () => {
      setTokens("access123", "refresh456");
      expect(getAccessToken()).toBe("access123");
      expect(getRefreshToken()).toBe("refresh456");
    });

    it("clears tokens", () => {
      setTokens("access", "refresh");
      clearTokens();
      expect(getAccessToken()).toBeNull();
      expect(getRefreshToken()).toBeNull();
    });
  });

  describe("isAuthenticated", () => {
    it("returns false when no token", () => {
      expect(isAuthenticated()).toBe(false);
    });

    it("returns true when token exists", () => {
      setTokens("token", "refresh");
      expect(isAuthenticated()).toBe(true);
    });
  });

  describe("company code management", () => {
    it("returns null when no company code", () => {
      expect(getCompanyCode()).toBeNull();
    });

    it("stores company code in uppercase", () => {
      setCompanyCode("abc123");
      expect(getCompanyCode()).toBe("ABC123");
    });

    it("hasCompanyCode returns false when no code", () => {
      expect(hasCompanyCode()).toBe(false);
    });

    it("hasCompanyCode returns true for valid 6-char code", () => {
      setCompanyCode("TEST01");
      expect(hasCompanyCode()).toBe(true);
    });

    it("hasCompanyCode returns false for short code", () => {
      localStorage.setItem("taskmanager_company_code", "AB");
      expect(hasCompanyCode()).toBe(false);
    });
  });
});
