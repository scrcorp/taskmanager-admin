"use client";

/**
 * 배정 목록 페이지 -- 작업 배정을 테이블 형태로 관리합니다.
 *
 * Assignments list page with filtering, table view, pagination, and create modal.
 * Supports filtering by store, user, date, and status.
 */

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, ArrowLeft, AlertTriangle } from "lucide-react";
import {
  useAssignments,
  useCreateAssignment,
} from "@/hooks/useAssignments";
import { useStores } from "@/hooks/useStores";
import { useUsers } from "@/hooks/useUsers";
import { useShifts } from "@/hooks/useShifts";
import { usePositions } from "@/hooks/usePositions";
import { Button, Input, Select, Card, Table, Modal, Badge, Pagination, LoadingSpinner } from "@/components/ui";
import { useChecklistTemplates } from "@/hooks/useChecklists";
import { useOvertimeAlerts } from "@/hooks/useOvertimeAlerts";
import type { OvertimeAlert } from "@/hooks/useOvertimeAlerts";
import { useToast } from "@/components/ui/Toast";
import { formatFixedDate, parseApiError } from "@/lib/utils";
import type { Assignment, Store, User, Shift, Position } from "@/types";

/** 배정 상태에 따른 뱃지 변형 매핑 (Status to badge variant mapping) */
const statusBadgeVariant: Record<string, "default" | "warning" | "success"> = {
  assigned: "default",
  in_progress: "warning",
  completed: "success",
};

/** 배정 상태 라벨 매핑 (Status label mapping) */
const statusLabel: Record<string, string> = {
  assigned: "Assigned",
  in_progress: "In Progress",
  completed: "Completed",
};

const PER_PAGE: number = 20;

export default function AssignmentsListPage(): React.ReactElement {
  const router = useRouter();
  const { toast } = useToast();

  // -- Filter state --
  const [filterStoreId, setFilterStoreId] = useState<string>("");
  const [filterUserId, setFilterUserId] = useState<string>("");
  const [filterDate, setFilterDate] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  // -- Modal state --
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [formStoreId, setFormStoreId] = useState<string>("");
  const [formShiftId, setFormShiftId] = useState<string>("");
  const [formPositionId, setFormPositionId] = useState<string>("");
  const [formUserId, setFormUserId] = useState<string>("");
  const [formDate, setFormDate] = useState<string>("");

  // -- Data hooks --
  const { data: assignmentsData, isLoading } = useAssignments({
    store_id: filterStoreId || undefined,
    user_id: filterUserId || undefined,
    work_date: filterDate || undefined,
    status: (filterStatus || undefined) as "assigned" | "in_progress" | "completed" | undefined,
    page,
    per_page: PER_PAGE,
  });
  const { data: stores } = useStores();
  const { data: users } = useUsers();
  const { data: shifts } = useShifts(formStoreId || undefined);
  const { data: positions } = usePositions(formStoreId || undefined);
  const createAssignment = useCreateAssignment();

  // Overtime alerts for selected store
  const { data: overtimeAlerts } = useOvertimeAlerts(filterStoreId);
  const activeAlerts: OvertimeAlert[] = (overtimeAlerts ?? []).filter(
    (a: OvertimeAlert) => a.over_hours > 0,
  );

  // 선택된 조합에 체크리스트 템플릿이 존재하는지 확인
  // Check if a checklist template exists for the selected combo
  const comboSelected: boolean = !!(formStoreId && formShiftId && formPositionId);
  const { data: matchingTemplates, isLoading: isCheckingTemplate } = useChecklistTemplates(
    formStoreId || undefined,
    comboSelected ? { shift_id: formShiftId, position_id: formPositionId } : undefined,
  );
  const hasTemplate: boolean = comboSelected && (matchingTemplates ?? []).length > 0;

  const assignments: Assignment[] = assignmentsData?.items ?? [];
  const totalPages: number = assignmentsData
    ? Math.ceil(assignmentsData.total / assignmentsData.per_page)
    : 1;

  const storeOptions: { value: string; label: string }[] = [
    { value: "", label: "All Stores" },
    ...(stores ?? []).map((s: Store) => ({ value: s.id, label: s.name })),
  ];

  const userOptions: { value: string; label: string }[] = [
    { value: "", label: "All Workers" },
    ...(users ?? []).map((u: User) => ({ value: u.id, label: u.full_name })),
  ];

  const statusOptions: { value: string; label: string }[] = [
    { value: "", label: "All Status" },
    { value: "assigned", label: "Assigned" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
  ];

  const shiftOptions: { value: string; label: string }[] = (shifts ?? []).map(
    (s: Shift) => ({ value: s.id, label: s.name }),
  );

  const positionOptions: { value: string; label: string }[] = (
    positions ?? []
  ).map((p: Position) => ({ value: p.id, label: p.name }));

  const formUserOptions: { value: string; label: string }[] = (
    users ?? []
  ).map((u: User) => ({ value: u.id, label: u.full_name }));

  const formStoreOptions: { value: string; label: string }[] = (
    stores ?? []
  ).map((s: Store) => ({ value: s.id, label: s.name }));

  /** 테이블 컬럼 정의 (Table column definitions) */
  const columns: {
    key: string;
    header: string;
    render?: (item: Assignment) => React.ReactNode;
    className?: string;
  }[] = [
    {
      key: "user_name",
      header: "Worker",
    },
    {
      key: "store_name",
      header: "Store",
    },
    {
      key: "shift_name",
      header: "Shift",
    },
    {
      key: "position_name",
      header: "Position",
    },
    {
      key: "work_date",
      header: "Date",
      render: (item: Assignment): React.ReactNode => formatFixedDate(item.work_date),
    },
    {
      key: "status",
      header: "Status",
      render: (item: Assignment): React.ReactNode => (
        <Badge variant={statusBadgeVariant[item.status] ?? "default"}>
          {statusLabel[item.status] ?? item.status}
        </Badge>
      ),
    },
    {
      key: "progress",
      header: "Progress",
      render: (item: Assignment): React.ReactNode => {
        const percentage: number =
          item.total_items > 0
            ? Math.round((item.completed_items / item.total_items) * 100)
            : 0;
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-xs text-text-secondary">
              {item.completed_items}/{item.total_items}
            </span>
          </div>
        );
      },
    },
  ];

  const handleRowClick: (item: Assignment) => void = useCallback(
    (item: Assignment): void => {
      router.push(`/schedules/${item.id}`);
    },
    [router],
  );

  const handleOpenCreate: () => void = useCallback((): void => {
    setFormStoreId("");
    setFormShiftId("");
    setFormPositionId("");
    setFormUserId("");
    setFormDate("");
    setIsCreateOpen(true);
  }, []);

  const handleStoreChange: (storeId: string) => void = useCallback(
    (storeId: string): void => {
      setFormStoreId(storeId);
      setFormShiftId("");
      setFormPositionId("");
    },
    [],
  );

  const handleCreateSubmit: () => void = useCallback((): void => {
    if (!formStoreId || !formShiftId || !formPositionId || !formUserId || !formDate) {
      toast({ type: "error", message: "Please fill in all fields." });
      return;
    }

    createAssignment.mutate(
      {
        store_id: formStoreId,
        shift_id: formShiftId,
        position_id: formPositionId,
        user_id: formUserId,
        work_date: formDate,
      },
      {
        onSuccess: (): void => {
          toast({ type: "success", message: "Assignment created successfully." });
          setIsCreateOpen(false);
        },
        onError: (err): void => {
          toast({ type: "error", message: parseApiError(err, "Failed to create assignment.") });
        },
      },
    );
  }, [formStoreId, formShiftId, formPositionId, formUserId, formDate, createAssignment, toast]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => router.push("/schedules")}
          className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface-hover transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-extrabold text-text flex-1">Schedules</h1>
        <Button variant="primary" size="md" onClick={handleOpenCreate}>
          <Plus size={16} />
          Assign Work
        </Button>
      </div>

      {/* Filter bar */}
      <Card className="mb-6" padding="p-4">
        <div className="flex items-end gap-3 flex-wrap">
          <div className="w-44">
            <Select
              label="Store"
              options={storeOptions}
              value={filterStoreId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setFilterStoreId(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="w-44">
            <Select
              label="Worker"
              options={userOptions}
              value={filterUserId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setFilterUserId(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="w-44">
            <Input
              label="Date"
              type="date"
              value={filterDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setFilterDate(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="w-44">
            <Select
              label="Status"
              options={statusOptions}
              value={filterStatus}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </Card>

      {/* Overtime Alerts Panel */}
      {filterStoreId && activeAlerts.length > 0 && (
        <Card className="mb-6" padding="p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-danger" />
            <h3 className="text-sm font-bold text-text">
              Overtime Alerts
            </h3>
            <Badge variant="danger">
              {activeAlerts.length}
            </Badge>
          </div>
          <div className="space-y-2">
            {activeAlerts.map((alert: OvertimeAlert) => (
              <div
                key={alert.user_id}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-surface"
              >
                <span className="text-sm text-text">{alert.user_name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-text-muted">
                    {alert.total_hours.toFixed(1)}h / {alert.max_weekly}h
                  </span>
                  <Badge variant="danger">+{alert.over_hours.toFixed(1)}h</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Table */}
      <Card padding="p-0">
        <Table<Assignment>
          columns={columns}
          data={assignments}
          isLoading={isLoading}
          onRowClick={handleRowClick}
          emptyMessage="No assignments found."
        />
      </Card>

      {/* Pagination */}
      <div className="mt-4 flex justify-center">
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Create Assignment Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Assign Work"
        size="md"
      >
        <div className="flex flex-col gap-4">
          <Select
            label="Store"
            options={formStoreOptions}
            placeholder="Select Store"
            value={formStoreId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              handleStoreChange(e.target.value)
            }
          />
          <Select
            label="Shift"
            options={shiftOptions}
            placeholder="Select Shift"
            value={formShiftId}
            disabled={!formStoreId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setFormShiftId(e.target.value)
            }
          />
          <Select
            label="Position"
            options={positionOptions}
            placeholder="Select Position"
            value={formPositionId}
            disabled={!formStoreId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setFormPositionId(e.target.value)
            }
          />
          {/* 템플릿 미존재 경고 — No template warning */}
          {comboSelected && !isCheckingTemplate && !hasTemplate && (
            <div className="flex items-start gap-2 rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>
                No checklist template exists for this combination. Please create a checklist template first before assigning work.
              </span>
            </div>
          )}
          <Select
            label="Worker"
            options={formUserOptions}
            placeholder="Select Worker"
            value={formUserId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setFormUserId(e.target.value)
            }
          />
          <Input
            label="Work Date"
            type="date"
            value={formDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormDate(e.target.value)
            }
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateSubmit}
              isLoading={createAssignment.isPending}
              disabled={comboSelected && !hasTemplate}
            >
              Create
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
