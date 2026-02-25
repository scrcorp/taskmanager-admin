"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * 입력 필드 컴포넌트 -- 라벨과 에러 메시지를 지원하는 다크 테마 텍스트 입력입니다.
 *
 * Dark-themed text input component with label and error message support.
 *
 * @param label - 입력 필드 라벨 (Input field label)
 * @param error - 에러 메시지 (Error message displayed below input)
 */

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(
    { label, error, className, id, ...rest }: InputProps,
    ref: React.ForwardedRef<HTMLInputElement>,
  ): React.ReactElement {
    const inputId: string = id || `input-${label?.replace(/\s+/g, "-").toLowerCase() || "field"}`;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent disabled:opacity-50 disabled:cursor-not-allowed",
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
