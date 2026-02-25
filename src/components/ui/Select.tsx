"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * 셀렉트 드롭다운 컴포넌트 -- 라벨과 에러 메시지를 지원하는 다크 테마 셀렉트입니다.
 *
 * Dark-themed select dropdown component with label and error message support.
 *
 * @param label - 셀렉트 필드 라벨 (Select field label)
 * @param error - 에러 메시지 (Error message displayed below select)
 * @param options - 셀렉트 옵션 배열 (Array of select options)
 * @param placeholder - 기본 선택 안내 텍스트 (Placeholder text)
 */

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    { label, error, options, placeholder, className, id, ...rest }: SelectProps,
    ref: React.ForwardedRef<HTMLSelectElement>,
  ): React.ReactElement {
    const selectId: string = id || `select-${label?.replace(/\s+/g, "-").toLowerCase() || "field"}`;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer",
            error && "border-danger focus:ring-danger/50 focus:border-danger",
            className,
          )}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option: SelectOption) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-xs text-danger">{error}</p>
        )}
      </div>
    );
  },
);
