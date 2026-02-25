"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * 텍스트 영역 컴포넌트 -- 라벨과 에러 메시지를 지원하는 다크 테마 텍스트 영역입니다.
 *
 * Dark-themed textarea component with label and error message support.
 *
 * @param label - 텍스트 영역 라벨 (Textarea field label)
 * @param error - 에러 메시지 (Error message displayed below textarea)
 * @param rows - 텍스트 영역 행 수 (Number of visible text rows)
 */

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { label, error, rows = 4, className, id, ...rest }: TextareaProps,
    ref: React.ForwardedRef<HTMLTextAreaElement>,
  ): React.ReactElement {
    const textareaId: string = id || `textarea-${label?.replace(/\s+/g, "-").toLowerCase() || "field"}`;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={cn(
            "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted transition-colors duration-150 resize-y focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-danger focus:ring-danger/50 focus:border-danger",
            className,
          )}
          {...rest}
        />
        {error && (
          <p className="text-xs text-danger">{error}</p>
        )}
      </div>
    );
  },
);
