/**
 * utils 유틸리티 테스트 — 날짜 포맷팅 + 페이지 계산 검증.
 *
 * 테스트 범위:
 * - formatDate: ISO 날짜 문자열 → 로컬 날짜 포맷
 * - formatDateTime: ISO 날짜 문자열 → 로컬 날짜+시간 포맷
 * - getTotalPages: 전체 건수 + 페이지당 건수 → 총 페이지 수 (최소 1)
 */

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
