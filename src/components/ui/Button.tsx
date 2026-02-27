"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "./LoadingSpinner";

/**
 * 버튼 컴포넌트 -- 다양한 변형과 크기를 지원하는 재사용 가능한 버튼입니다.
 *
 * Reusable button component with multiple variants and sizes.
 *
 * @param variant - 버튼 스타일 변형 (Button style variant)
 * @param size - 버튼 크기 (Button size)
 * @param isLoading - 로딩 상태 표시 여부 (Whether to show loading state)
 */

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-light active:bg-accent",
  secondary:
    "bg-surface border border-border text-text hover:bg-surface-hover active:bg-surface",
  danger:
    "bg-danger text-white hover:opacity-90 active:opacity-100",
  ghost:
    "bg-transparent text-text-secondary hover:bg-surface-hover hover:text-text active:bg-surface",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-6 py-2.5 text-base gap-2",
};

interface ClearButtonProps {
  onClick: () => void;
  label?: string;
}

export function ClearButton({ onClick, label = "Clear" }: ClearButtonProps): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs text-accent hover:text-accent-light transition-colors"
    >
      {label}
    </button>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  children,
  className,
  onClick,
  type = "button",
}: ButtonProps): React.ReactElement {
  const isDisabled: boolean = disabled || isLoading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {isLoading && <LoadingSpinner size="sm" />}
      {children}
    </button>
  );
}
