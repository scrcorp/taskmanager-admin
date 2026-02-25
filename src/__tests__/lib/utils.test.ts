import { describe, it, expect } from "vitest";
import { formatDate, formatDateTime, getTotalPages } from "@/lib/utils";

describe("utils", () => {
  describe("formatDate", () => {
    it("formats ISO date string", () => {
      const result = formatDate("2026-01-15T10:30:00Z");
      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");
    });
  });

  describe("formatDateTime", () => {
    it("formats ISO date string with time", () => {
      const result = formatDateTime("2026-01-15T10:30:00Z");
      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");
    });
  });

  describe("getTotalPages", () => {
    it("calculates pages correctly", () => {
      expect(getTotalPages(100, 10)).toBe(10);
      expect(getTotalPages(101, 10)).toBe(11);
      expect(getTotalPages(0, 10)).toBe(1); // Math.max(1, ...) ensures minimum 1
      expect(getTotalPages(5, 10)).toBe(1);
    });
  });
});
