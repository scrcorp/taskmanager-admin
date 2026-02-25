"use client";

/**
 * 체크리스트 인스턴스 테이블 컴포넌트 -- 인스턴스 목록을 테이블 형태로 표시합니다.
 *
 * Checklist instance table component with progress bar and status badges.
 */

import React from "react";
import { Table, Badge } from "@/components/ui";
import { formatFixedDate } from "@/lib/utils";
import type { ChecklistInstance } from "@/types";

/** 인스턴스 상태에 따른 뱃지 변형 매핑 (Status to badge variant mapping) */
const statusBadgeVariant: Record<string, "default" | "warning" | "success"> = {
  pending: "default",
  in_progress: "warning",
  completed: "success",
};

/** 인스턴스 상태 라벨 매핑 (Status label mapping) */
const statusLabel: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
};

interface ChecklistInstanceTableProps {
  instances: ChecklistInstance[];
  isLoading: boolean;
  onRowClick: (instance: ChecklistInstance) => void;
}

export function ChecklistInstanceTable({
  instances,
  isLoading,
  onRowClick,
}: ChecklistInstanceTableProps): React.ReactElement {
  const columns: {
    key: string;
    header: string;
    render?: (item: ChecklistInstance) => React.ReactNode;
    className?: string;
  }[] = [
    {
      key: "work_date",
      header: "Date",
      render: (item: ChecklistInstance): React.ReactNode =>
        formatFixedDate(item.work_date),
    },
    {
      key: "store_name",
      header: "Store",
      render: (item: ChecklistInstance): React.ReactNode => (
        <span className="text-text-secondary">
          {item.store_name ?? "-"}
        </span>
      ),
    },
    {
      key: "user_name",
      header: "Staff",
      render: (item: ChecklistInstance): React.ReactNode => (
        <span className="text-text">{item.user_name ?? "-"}</span>
      ),
    },
    {
      key: "template_title",
      header: "Template",
      render: (item: ChecklistInstance): React.ReactNode => (
        <span className="text-text-secondary text-xs">
          {item.template_title ?? "-"}
        </span>
      ),
      className: "min-w-[140px]",
    },
    {
      key: "progress",
      header: "Progress",
      render: (item: ChecklistInstance): React.ReactNode => {
        const pct: number =
          item.total_items > 0
            ? Math.round((item.completed_items / item.total_items) * 100)
            : 0;
        return (
          <div className="flex items-center gap-2 min-w-[120px]">
            <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-text-secondary whitespace-nowrap">
              {item.completed_items}/{item.total_items}
            </span>
          </div>
        );
      },
      className: "min-w-[160px]",
    },
    {
      key: "status",
      header: "Status",
      render: (item: ChecklistInstance): React.ReactNode => (
        <Badge variant={statusBadgeVariant[item.status] ?? "default"}>
          {statusLabel[item.status] ?? item.status}
        </Badge>
      ),
    },
  ];

  return (
    <Table<ChecklistInstance>
      columns={columns}
      data={instances}
      isLoading={isLoading}
      onRowClick={onRowClick}
      emptyMessage="No checklist instances found."
    />
  );
}
