"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * 로딩 스피너 컴포넌트 -- 비동기 작업 중 로딩 상태를 표시합니다.
 *
 * Animated loading spinner component with configurable size.
 *
 * @param size - 스피너 크기 (Spinner size): 'sm' | 'md' | 'lg'
 * @param className - 추가 CSS 클래스 (Additional CSS classes)
 */

type SpinnerSize = "sm" | "md" | "lg";

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

const sizeMap: Record<SpinnerSize, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-3",
};

export function LoadingSpinner({
  size = "md",
  className,
}: LoadingSpinnerProps): React.ReactElement {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-accent border-t-transparent",
        sizeMap[size],
        className,
      )}
      role="status"
      aria-label="Loading"
    />
  );
}
