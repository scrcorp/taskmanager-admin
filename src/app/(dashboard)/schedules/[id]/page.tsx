"use client";

/**
 * 스케줄 상세 페이지 — 목업 리디자인 + 실 API 연동.
 */

import { useParams, useRouter } from "next/navigation";
import { ScheduleDetailPage } from "@/components/schedules/redesign/ScheduleDetailPage";
import {
  useSchedule, useDeleteSchedule, useRevertSchedule, useCancelSchedule,
  useScheduleAuditLog,
} from "@/hooks/useSchedules";
import { useUser } from "@/hooks/useUsers";
import type { ScheduleAuditEvent, AuditEventType } from "@/components/schedules/redesign/types";
import {
  adaptScheduleToMockBlock, adaptUserToStaff,
} from "@/components/schedules/redesign/adapters";

export default function SchedulesDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const scheduleQ = useSchedule(id);
  const userQ = useUser(scheduleQ.data?.user_id);
  const auditLogQ = useScheduleAuditLog(id);
  const deleteMutation = useDeleteSchedule();
  const revertMutation = useRevertSchedule();
  const cancelMutation = useCancelSchedule();

  if (scheduleQ.isLoading || userQ.isLoading) {
    return <div className="py-8 text-center text-[var(--color-text-muted)]">Loading…</div>;
  }
  if (scheduleQ.error) {
    return <div className="py-8 text-center text-[var(--color-danger)]">{scheduleQ.error.message}</div>;
  }
  if (!scheduleQ.data || !userQ.data) {
    return <div className="py-8 text-center text-[var(--color-text-muted)]">Schedule not found</div>;
  }

  const block = adaptScheduleToMockBlock(scheduleQ.data, scheduleQ.data.store_id);
  const st = adaptUserToStaff(userQ.data);

  // Audit log → mockup ScheduleAuditEvent shape
  const auditEvents: ScheduleAuditEvent[] = (auditLogQ.data ?? []).map((l) => ({
    id: l.id,
    scheduleId: l.schedule_id,
    eventType: l.event_type as AuditEventType,
    actorId: l.actor_id ?? "",
    actorName: l.actor_name ?? "Unknown",
    actorRole: (l.actor_role as "owner" | "gm" | "sv" | "staff") ?? "staff",
    timestamp: l.timestamp,
    description: l.description ?? "",
    reason: l.reason ?? undefined,
  }));

  const handleDelete = () => {
    if (!window.confirm("Delete this schedule?")) return;
    deleteMutation.mutate(id, { onSuccess: () => router.push("/schedules") });
  };
  const handleRevert = () => {
    if (!window.confirm("Revert this confirmed schedule to requested?")) return;
    revertMutation.mutate(id, { onSuccess: () => scheduleQ.refetch() });
  };
  const handleCancelConfirmed = () => {
    const reason = window.prompt("Cancellation reason (optional):") ?? undefined;
    cancelMutation.mutate({ id, cancellation_reason: reason }, {
      onSuccess: () => scheduleQ.refetch(),
    });
  };

  return (
    <ScheduleDetailPage
      block={block}
      staff={st}
      showCost={true}
      auditEvents={auditEvents}
      relatedSchedules={[]}
      attendance={null}
      onBack={() => router.push("/schedules")}
      onEdit={() => {
        // TODO: ScheduleEditModal을 페이지에서도 열 수 있게 수정 필요
        router.push(`/schedules?edit=${id}`);
      }}
      onSwap={() => {
        // TODO: SwapModal 통합 후 연결
        window.alert("Swap from detail page: TODO");
      }}
      onRevert={handleRevert}
      onDelete={block.status === "confirmed" ? handleCancelConfirmed : handleDelete}
    />
  );
}
