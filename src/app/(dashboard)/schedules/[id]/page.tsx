"use client";

/**
 * 스케줄 상세 페이지 — 목업 리디자인 이관.
 *
 * Schedule detail with snapshot vs current, attendance comparison,
 * cost breakdown (GM only), audit timeline, cancel/reject reason banner.
 */

import { useParams, useRouter } from "next/navigation";
import { ScheduleDetailPage } from "@/components/schedules/redesign/ScheduleDetailPage";
import { schedules, staff } from "@/components/schedules/redesign/mockData";

export default function SchedulesDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const block = schedules.find((s) => s.id === id);
  const st = block ? staff.find((x) => x.id === block.staffId) : null;

  if (!block || !st) {
    return (
      <div className="py-8 text-center text-[var(--color-text-muted)]">
        Schedule not found
      </div>
    );
  }

  return (
    <ScheduleDetailPage
      block={block}
      staff={st}
      showCost={true}
      onBack={() => router.push("/schedules")}
      onEdit={() => {
        // TODO Task 8d: open edit modal via API
      }}
      onSwap={() => {
        // TODO Task 8d
      }}
      onRevert={() => {
        // TODO Task 8d
      }}
      onDelete={() => {
        // TODO Task 8d
      }}
    />
  );
}
