"use client";

import React, { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import {
  Button,
  Input,
  Select,
  Textarea,
} from "@/components/ui";
import { useCorrectAttendance } from "@/hooks";
import type { Attendance } from "@/types";
import { formatDateTime } from "@/lib/utils";
import { ReasonPicker } from "./ReasonPicker";

/**
 * Attendance correction modal — Status / Clock In / Clock Out / Note 를 한 번에 보정.
 *
 * 인라인 편집을 대체하는 audit-aware 보정 모달.
 * - 각 필드는 입력 즉시 Before → After 가 보임 (변경 없으면 After 숨김)
 * - Reason 필수 (preset + Other). 없으면 Save 비활성
 * - 변경된 필드들을 순차 PATCH /correct 로 전송 (서버가 매 요청마다 total time 재계산)
 *
 * useModal().open() 으로 띄울 것 — close(true) 면 성공, close() 면 취소.
 */

type StatusKey =
  | "upcoming"
  | "soon"
  | "working"
  | "on_break"
  | "late"
  | "clocked_out"
  | "no_show"
  | "cancelled";

const STATUS_OPTIONS: Array<{ value: StatusKey; label: string }> = [
  { value: "upcoming", label: "Upcoming" },
  { value: "soon", label: "Soon" },
  { value: "late", label: "Late" },
  { value: "working", label: "Working" },
  { value: "on_break", label: "On Break" },
  { value: "clocked_out", label: "Clocked Out" },
  { value: "no_show", label: "No Show" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_LABELS: Record<string, string> = Object.fromEntries(
  STATUS_OPTIONS.map((o) => [o.value, o.label]),
);

function isoToLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number): string => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

function localInputToIso(s: string): string | null {
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

interface Draft {
  clock_in: string;
  clock_out: string;
  status: StatusKey;
  note: string;
}

interface AttendanceCorrectionModalProps {
  attendance: Attendance;
  tz?: string;
  /** 성공 시 true, 취소면 호출되지 않음. modal.open 의 close handler 를 그대로 넘김. */
  onClose: (success?: boolean) => void;
}

export function AttendanceCorrectionModal({
  attendance,
  tz,
  onClose,
}: AttendanceCorrectionModalProps): React.ReactElement {
  const original: Draft = useMemo(
    () => ({
      clock_in: isoToLocalInput(attendance.clock_in),
      clock_out: isoToLocalInput(attendance.clock_out),
      status: attendance.status as StatusKey,
      note: attendance.note ?? "",
    }),
    [attendance],
  );

  const [draft, setDraft] = useState<Draft>(original);
  const [reason, setReason] = useState<string>("");
  const correctAttendance = useCorrectAttendance();

  /** 변경된 필드 목록 — Before → After diff 표시 + 저장 활성 조건 */
  const changedFields = useMemo<
    Array<{ key: keyof Draft; label: string; before: string; after: string }>
  >(() => {
    const out: Array<{ key: keyof Draft; label: string; before: string; after: string }> = [];
    if (draft.status !== original.status) {
      out.push({
        key: "status",
        label: "Status",
        before: STATUS_LABELS[original.status] ?? original.status,
        after: STATUS_LABELS[draft.status] ?? draft.status,
      });
    }
    if (draft.clock_in !== original.clock_in) {
      out.push({
        key: "clock_in",
        label: "Clock In",
        before: attendance.clock_in ? formatDateTime(attendance.clock_in, tz) : "—",
        after: draft.clock_in
          ? formatDateTime(localInputToIso(draft.clock_in) ?? "", tz)
          : "—",
      });
    }
    if (draft.clock_out !== original.clock_out) {
      out.push({
        key: "clock_out",
        label: "Clock Out",
        before: attendance.clock_out ? formatDateTime(attendance.clock_out, tz) : "—",
        after: draft.clock_out
          ? formatDateTime(localInputToIso(draft.clock_out) ?? "", tz)
          : "—",
      });
    }
    if (draft.note !== original.note) {
      out.push({
        key: "note",
        label: "Note",
        before: original.note || "—",
        after: draft.note || "—",
      });
    }
    return out;
  }, [draft, original, attendance, tz]);

  const reasonValid: boolean = reason.trim().length > 0;
  const canSave: boolean = changedFields.length > 0 && reasonValid;

  const handleSave = async (): Promise<void> => {
    if (!canSave) return;
    const trimmedReason = reason.trim();
    try {
      // 순차 호출 — 시간 재계산 누적 (서버가 매 요청마다 total_work_minutes 재계산)
      for (const f of changedFields) {
        const value: string =
          f.key === "clock_in" || f.key === "clock_out"
            ? localInputToIso(draft[f.key]) ?? ""
            : (draft[f.key] as string);
        if (!value && (f.key === "clock_in" || f.key === "clock_out")) continue;
        await correctAttendance.mutateAsync({
          id: attendance.id,
          data: {
            field_name: f.key,
            corrected_value: value,
            reason: trimmedReason,
          },
        });
      }
      onClose(true);
    } catch {
      // hook 자동 모달 — 모달은 열어둠 (사용자가 reason 만 보강하면 재시도 가능)
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* 메타 — 어떤 attendance 를 고치는지 컨텍스트 */}
      <div className="text-xs text-text-muted">
        {attendance.user_name} · {attendance.store_name} · {attendance.work_date}
      </div>

      {/* Reason — 최상단, 필수 */}
      <ReasonPicker
        value={reason}
        onChange={setReason}
        hint="Required. Choose a preset or pick Other to describe."
      />

      {/* 편집 필드 — 좌: input, 우: Before → After 미리보기 */}
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Status"
          value={draft.status}
          onChange={(e) => setDraft({ ...draft, status: e.target.value as StatusKey })}
          options={STATUS_OPTIONS}
        />
        <div /> {/* spacer to keep status alone on the row */}

        <Input
          label="Clock In"
          type="datetime-local"
          value={draft.clock_in}
          onChange={(e) => setDraft({ ...draft, clock_in: e.target.value })}
        />
        <Input
          label="Clock Out"
          type="datetime-local"
          value={draft.clock_out}
          onChange={(e) => setDraft({ ...draft, clock_out: e.target.value })}
        />
      </div>

      <Textarea
        label="Note"
        rows={2}
        value={draft.note}
        onChange={(e) => setDraft({ ...draft, note: e.target.value })}
        placeholder="Manager memo (optional)"
      />

      {/* Diff 프리뷰 — 변경된 필드만 노출 */}
      {changedFields.length > 0 && (
        <div className="rounded-lg border border-border bg-surface-hover p-3">
          <div className="text-xs text-text-muted mb-2">
            Changes ({changedFields.length})
          </div>
          <ul className="space-y-1.5">
            {changedFields.map((f) => (
              <li key={f.key} className="flex items-center gap-2 text-sm">
                <span className="text-text-secondary min-w-[80px]">{f.label}</span>
                <span className="text-text-muted line-through">{f.before}</span>
                <ArrowRight size={12} className="text-text-muted" />
                <span className="text-text font-medium">{f.after}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 액션 */}
      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <Button variant="secondary" onClick={() => onClose()}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={!canSave}
          isLoading={correctAttendance.isPending}
        >
          Save correction
        </Button>
      </div>
    </div>
  );
}
