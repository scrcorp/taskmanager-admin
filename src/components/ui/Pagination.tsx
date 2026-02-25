"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * 페이지네이션 컴포넌트 -- 이전/다음 버튼과 페이지 번호를 표시합니다.
 *
 * Pagination component with Previous/Next buttons and page number indicators.
 *
 * @param page - 현재 페이지 번호 (Current page number, 1-based)
 * @param totalPages - 전체 페이지 수 (Total number of pages)
 * @param onPageChange - 페이지 변경 핸들러 (Handler called with new page number)
 */

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps): React.ReactElement | null {
  if (totalPages <= 1) {
    return null;
  }

  const isFirstPage: boolean = page <= 1;
  const isLastPage: boolean = page >= totalPages;

  /** 표시할 페이지 번호 목록을 생성합니다. (Generate visible page numbers.) */
  const getPageNumbers = (): (number | "ellipsis")[] => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisible: number = 5;

    if (totalPages <= maxVisible) {
      for (let i: number = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (page > 3) {
        pages.push("ellipsis");
      }

      const start: number = Math.max(2, page - 1);
      const end: number = Math.min(totalPages - 1, page + 1);

      for (let i: number = start; i <= end; i++) {
        pages.push(i);
      }

      if (page < totalPages - 2) {
        pages.push("ellipsis");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers: (number | "ellipsis")[] = getPageNumbers();

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        disabled={isFirstPage}
        onClick={() => onPageChange(page - 1)}
        className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface-hover transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pageNumbers.map((pageNum: number | "ellipsis", index: number) => {
        if (pageNum === "ellipsis") {
          return (
            <span
              key={`ellipsis-${index}`}
              className="px-2 py-1 text-sm text-text-muted"
            >
              ...
            </span>
          );
        }

        const isCurrentPage: boolean = pageNum === page;

        return (
          <button
            key={pageNum}
            type="button"
            onClick={() => onPageChange(pageNum)}
            className={cn(
              "min-w-[32px] px-2 py-1 rounded-lg text-sm font-medium transition-colors duration-150 cursor-pointer",
              isCurrentPage
                ? "bg-accent text-white"
                : "text-text-muted hover:text-text hover:bg-surface-hover",
            )}
          >
            {pageNum}
          </button>
        );
      })}

      <button
        type="button"
        disabled={isLastPage}
        onClick={() => onPageChange(page + 1)}
        className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface-hover transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
