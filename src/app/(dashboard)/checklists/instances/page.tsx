"use client";

/**
 * 체크리스트 인스턴스 목록 페이지 -- 실행된 체크리스트 인스턴스를 관리합니다.
 *
 * Checklist instances list page with date, store, and status filters.
 * Shows a table of checklist instances with progress and navigation to detail.
 * Supports URL query params (work_date, status, store_id) for pre-filtering.
 */

import React, { Suspense, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useChecklistInstances } from "@/hooks/useChecklistInstances";
import { useStores } from "@/hooks/useStores";
import {
  Card,
  Select,
  Input,
  Pagination,
  LoadingSpinner,
} from "@/components/ui";
import { ChecklistInstanceTable } from "@/components/checklists/ChecklistInstanceTable";
import type { ChecklistInstance, Store } from "@/types";

const PER_PAGE: number = 20;

function ChecklistInstancesContent(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();

  // -- Filter state (initialized from URL query params) --
  const [filterStoreId, setFilterStoreId] = useState<string>(
    () => searchParams.get("store_id") ?? "",
  );
  const [filterDate, setFilterDate] = useState<string>(
    () => searchParams.get("work_date") ?? "",
  );
  const [filterStatus, setFilterStatus] = useState<string>(
    () => searchParams.get("status") ?? "",
  );
  const [page, setPage] = useState<number>(1);

  // -- Data hooks --
  const { data: instancesData, isLoading } = useChecklistInstances({
    store_id: filterStoreId || undefined,
    work_date: filterDate || undefined,
    status: filterStatus || undefined,
    page,
    per_page: PER_PAGE,
  });
  const { data: stores } = useStores();

  const instances: ChecklistInstance[] = instancesData?.items ?? [];
  const totalPages: number = instancesData
    ? Math.ceil(instancesData.total / instancesData.per_page)
    : 1;

  const storeFilterOptions: { value: string; label: string }[] = [
    { value: "", label: "All Stores" },
    ...(stores ?? []).map((s: Store) => ({ value: s.id, label: s.name })),
  ];

  const statusOptions: { value: string; label: string }[] = [
    { value: "", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
  ];

  const handleRowClick: (instance: ChecklistInstance) => void = useCallback(
    (instance: ChecklistInstance): void => {
      router.push(`/checklists/instances/${instance.id}`);
    },
    [router],
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-text">
            Checklist Instances
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            View checklist completion records
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <Card className="mb-6" padding="p-4">
        <div className="flex items-end gap-3 flex-wrap">
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
              label="Store"
              options={storeFilterOptions}
              value={filterStoreId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setFilterStoreId(e.target.value);
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
          {(filterDate || filterStoreId || filterStatus) && (
            <button
              type="button"
              onClick={() => {
                setFilterDate("");
                setFilterStoreId("");
                setFilterStatus("");
                setPage(1);
              }}
              className="text-xs text-text-muted hover:text-text transition-colors pb-2"
            >
              Clear filters
            </button>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card padding="p-0">
        <ChecklistInstanceTable
          instances={instances}
          isLoading={isLoading}
          onRowClick={handleRowClick}
        />
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}

export default function ChecklistInstancesPage(): React.ReactElement {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <ChecklistInstancesContent />
    </Suspense>
  );
}
