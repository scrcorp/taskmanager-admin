"use client";

import React from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 빈 상태 컴포넌트 -- 데이터가 없을 때 안내 메시지를 표시합니다.
 *
 * Empty state component displayed when there is no data to show.
 *
 * @param message - 안내 메시지 (Message to display)
 * @param icon - 커스텀 아이콘 (Optional custom icon element)
 * @param className - 추가 CSS 클래스 (Additional CSS classes)
 */

interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  message,
  icon,
  className,
}: EmptyStateProps): React.ReactElement {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-text-muted",
        className,
      )}
    >
      <div className="mb-3">
        {icon || <Inbox className="h-10 w-10" />}
      </div>
      <p className="text-sm">{message}</p>
    </div>
  );
}
