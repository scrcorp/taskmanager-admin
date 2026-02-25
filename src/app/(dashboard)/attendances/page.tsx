"use client";

/**
 * 근태 관리 페이지 -- 날짜/매장/상태 필터가 있는 근태 기록 목록.
 *
 * Attendance management page showing a list of attendance records
 * with date, store, and status filters.
 */

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  User,
  MapPin,
  Calendar,
  LogIn,
  LogOut,
  Coffee,
} from "lucide-react";
import { useAttendances } from "@/hooks/useAttendances";
import { useStores } from "@/hooks/useStores";
import { Button, Card, Badge } from "@/components/ui";
import type { Attendance, Store } from "@/types";
import { cn, formatFixedDate } from "@/lib/utils";

/** 상태 탭 구성 -- Status tab configuration */
const statusTabs: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "clocked_in", label: "Clocked In" },
  { key: "on_break", label: "On Break" },
  { key: "clocked_out", label: "Clocked Out" },
];

/** 상태별 배지 색상 매핑 -- Status badge variant mapping */
const statusBadge: Record<
  string,
  { label: string; variant: "success" | "warning" | "default" }
> = {
  clocked_in: { label: "Clocked In", variant: "success" },
  on_break: { label: "On Break", variant: "warning" },
  clocked_out: { label: "Clocked Out", variant: "default" },
};

/** 분을 시:분 형식으로 변환합니다.
 *  Convert minutes to h:mm format. */
function formatMinutes(minutes: number | null): string {
  if (minutes == null) return "-";
  const h: number = Math.floor(minutes / 60);
  const m: number = minutes % 60;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

export default function AttendancesPage(): React.ReactElement {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const perPage: number = 20;

  const { data: stores } = useStores();
  const { data: attendancesData, isLoading } = useAttendances({
    store_id: selectedStoreId || undefined,
    work_date: selectedDate || undefined,
    status: activeTab !== "all" ? activeTab : undefined,
    page,
    per_page: perPage,
  });

  const attendances: Attendance[] = attendancesData?.items ?? [];
  const total: number = attendancesData?.total ?? 0;
  const totalPages: number = Math.max(1, Math.ceil(total / perPage));

  const activeStores: Store[] = useMemo(
    () => (stores ?? []).filter((s: Store) => s.is_active),
    [stores],
  );

  return (
    <div>
      {/* 헤더 (Header) */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text">Attendance</h1>
          <p className="text-sm text-text-muted mt-0.5">
            View and manage employee attendance records
          </p>
        </div>
      </div>

      {/* 필터 바 (Filter bar) */}
      <div className="flex items-center gap-3 mb-4">
        {/* 매장 필터 (Store filter) */}
        <select
          value={selectedStoreId}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            setSelectedStoreId(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-sm bg-surface border border-border rounded-lg text-text focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="">All Stores</option>
          {activeStores.map((store: Store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>

        {/* 날짜 필터 (Date filter) */}
        <input
          type="date"
          value={selectedDate}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSelectedDate(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-sm bg-surface border border-border rounded-lg text-text focus:outline-none focus:ring-1 focus:ring-accent"
        />
        {selectedDate && (
          <button
            type="button"
            onClick={() => {
              setSelectedDate("");
              setPage(1);
            }}
            className="text-xs text-text-muted hover:text-text transition-colors"
          >
            Clear date
          </button>
        )}
      </div>

      {/* 상태 탭 (Status tabs) */}
      <div className="flex items-center gap-1 mb-4 p-1 bg-surface rounded-lg border border-border w-fit">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setActiveTab(tab.key);
              setPage(1);
            }}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
              activeTab === tab.key
                ? "bg-accent text-white"
                : "text-text-secondary hover:text-text hover:bg-surface-hover",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 근태 목록 (Attendance list) */}
      {isLoading ? (
        <Card padding="p-16">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full border-accent border-t-transparent h-6 w-6 border-2" />
          </div>
        </Card>
      ) : attendances.length === 0 ? (
        <Card padding="p-16">
          <div className="text-center">
            <Clock
              size={40}
              className="mx-auto mb-3 text-text-muted opacity-50"
            />
            <p className="text-sm text-text-muted">
              No attendance records found.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {attendances.map((attendance: Attendance) => {
            const badge = statusBadge[attendance.status] ?? statusBadge.clocked_in;
            return (
              <Card
                key={attendance.id}
                padding="p-4"
                className="cursor-pointer hover:border-accent/50 transition-colors"
                onClick={() => router.push(`/attendances/${attendance.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* 사용자 이름 (User name) */}
                    <div className="flex items-center gap-2 min-w-[140px]">
                      <User size={14} className="text-text-muted shrink-0" />
                      <span className="text-sm font-semibold text-text truncate">
                        {attendance.user_name || "Unknown"}
                      </span>
                    </div>

                    {/* 매장 (Store) */}
                    <div className="flex items-center gap-1.5 min-w-[120px]">
                      <MapPin size={12} className="text-text-muted shrink-0" />
                      <span className="text-xs text-text-secondary truncate">
                        {attendance.store_name || "Unknown"}
                      </span>
                    </div>

                    {/* 날짜 (Date) */}
                    <div className="flex items-center gap-1.5 min-w-[110px]">
                      <Calendar
                        size={12}
                        className="text-text-muted shrink-0"
                      />
                      <span className="text-xs text-text-secondary">
                        {formatFixedDate(attendance.work_date)}
                      </span>
                    </div>

                    {/* 근무 시간 (Work time) */}
                    <div className="flex items-center gap-1.5">
                      <Clock
                        size={12}
                        className="text-text-muted shrink-0"
                      />
                      <span className="text-xs text-text-secondary">
                        {formatMinutes(attendance.total_work_minutes)}
                      </span>
                    </div>

                    {/* 휴식 시간 (Break time) */}
                    {attendance.total_break_minutes != null && attendance.total_break_minutes > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Coffee
                          size={12}
                          className="text-text-muted shrink-0"
                        />
                        <span className="text-xs text-text-secondary">
                          {formatMinutes(attendance.total_break_minutes)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 상태 배지 (Status badge) */}
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 페이지네이션 (Pagination) */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-text-secondary">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
