"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * 뱃지 컴포넌트 -- 상태나 카테고리를 나타내는 작은 라벨 알약 형태입니다.
 *
 * Small rounded pill badge for displaying status or category labels.
 *
 * @param variant - 뱃지 스타일 변형 (Badge style variant)
 * @param children - 뱃지 텍스트 (Badge text content)
 * @param className - 추가 CSS 클래스 (Additional CSS classes)
 */

type BadgeVariant = "default" | "success" | "warning" | "danger" | "accent" | "info";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-surface text-text-secondary border border-border",
  success: "bg-success-muted text-success",
  warning: "bg-warning-muted text-warning",
  danger: "bg-danger-muted text-danger",
  accent: "bg-accent-muted text-accent",
  info: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
};

export function Badge({
  variant = "default",
  children,
  className,
}: BadgeProps): React.ReactElement {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
