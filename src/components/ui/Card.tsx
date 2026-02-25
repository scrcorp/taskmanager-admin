"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * 카드 컴포넌트 -- 콘텐츠를 감싸는 다크 테마 카드 래퍼입니다.
 *
 * Dark-themed card wrapper component for grouping content.
 *
 * @param children - 카드 내부 콘텐츠 (Card content)
 * @param className - 추가 CSS 클래스 (Additional CSS classes)
 * @param padding - 패딩 클래스 (Padding class, defaults to "p-6")
 */

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: string;
  onClick?: () => void;
}

export function Card({
  children,
  className,
  padding = "p-6",
  onClick,
}: CardProps): React.ReactElement {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-xl",
        padding,
        className,
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") onClick(); } : undefined}
    >
      {children}
    </div>
  );
}
