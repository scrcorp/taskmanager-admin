"use client";

/**
 * 스태프 목록 페이지 -- 사용자 관리 페이지입니다.
 * 필터링, 검색, 생성 기능을 제공합니다.
 *
 * Staff List Page -- User management page with filtering, search, and creation.
 * Supports filtering by role and inactive toggle.
 */

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { useUsers, useCreateUser } from "@/hooks/useUsers";
import { useRoles } from "@/hooks/useRoles";
import { useStores } from "@/hooks/useStores";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Table, Badge, Modal, Select } from "@/components/ui";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useToast } from "@/components/ui/Toast";
import { formatDate, parseApiError } from "@/lib/utils";
import { useTimezone } from "@/hooks/useTimezone";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/lib/permissions";
import type { User, Role, Store } from "@/types";

/** 사용자 생성 폼 데이터 / User creation form data */
interface UserFormData {
  username: string;
  password: string;
  full_name: string;
  email: string;
  phone: string;
  role_id: string;
}

/** 테이블 컬럼 타입 / Table column type */
interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;
}

/** 초기 폼 상태 / Initial form state */
const INITIAL_FORM: UserFormData = {
  username: "",
  password: "",
  full_name: "",
  email: "",
  phone: "",
  role_id: "",
};

const STORAGE_KEY = "showInactiveUsers";

export default function UsersPage(): React.ReactElement {
  const router = useRouter();
  const { toast } = useToast();
  const { hasPermission } = usePermissions();
  const tz = useTimezone();
  const canManageUsers = hasPermission(PERMISSIONS.USERS_CREATE);

  /** 필터 상태 — 멀티셀렉트 */
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [staffSearch, setStaffSearch] = useState<string>("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>([]);
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  /** 외부 클릭 시 드롭다운 닫기 */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setOpenFilter(null);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /** 데이터 훅 / Data hooks */
  const userFilters = useMemo(
    () => (selectedStoreIds.length > 0 ? { store_ids: selectedStoreIds } : undefined),
    [selectedStoreIds],
  );
  const { data: users, isLoading: usersLoading } = useUsers(userFilters);
  const { data: roles } = useRoles();
  const { data: storesData } = useStores();
  const stores: Store[] = useMemo(() => storesData ?? [], [storesData]);
  const createUser = useCreateUser();

  /** Show Inactive 체크박스 상태 (localStorage) */
  const [showInactive, setShowInactive] = useState<boolean>(false);

  /** localStorage에서 초기값 로드 */
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") setShowInactive(true);
  }, []);

  /** 체크박스 변경 시 localStorage 저장 */
  const handleToggleInactive = useCallback((checked: boolean) => {
    setShowInactive(checked);
    localStorage.setItem(STORAGE_KEY, String(checked));
  }, []);

  /** 생성 모달 상태 / Create modal state */
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [createForm, setCreateForm] = useState<UserFormData>(INITIAL_FORM);

  /** 안전한 목록 추출 / Safe list extraction */
  const userList: User[] = useMemo(
    () => (Array.isArray(users) ? users : []),
    [users],
  );
  const roleList: Role[] = useMemo(
    () => (Array.isArray(roles) ? roles : []),
    [roles],
  );

  /** Inactive 사용자 수 / Inactive user count */
  const inactiveCount: number = useMemo(
    () => userList.filter((u: User) => !u.is_active).length,
    [userList],
  );

  /** 필터링 + 정렬된 사용자 목록 / Filtered and sorted user list */
  const filteredUsers: User[] = useMemo(() => {
    let result: User[] = userList;

    // Staff 멀티셀렉트 필터
    if (selectedStaffIds.length > 0) {
      result = result.filter((user: User) => selectedStaffIds.includes(user.id));
    }

    // 검색 필터
    const search = searchQuery.trim();
    if (search) {
      const query: string = search.toLowerCase();
      result = result.filter(
        (user: User) =>
          user.full_name.toLowerCase().includes(query) ||
          user.username.toLowerCase().includes(query) ||
          (user.email && user.email.toLowerCase().includes(query)),
      );
    }

    // 역할 멀티 필터
    if (selectedRoles.length > 0) {
      result = result.filter(
        (user: User) => selectedRoles.includes(user.role_name),
      );
    }

    // Inactive 필터: 체크 해제 시 Active만 표시
    if (!showInactive) {
      result = result.filter((user: User) => user.is_active);
    } else {
      result = [...result].sort((a: User, b: User) => {
        if (a.is_active === b.is_active) {
          return a.full_name.localeCompare(b.full_name);
        }
        return a.is_active ? -1 : 1;
      });
    }

    return result;
  }, [userList, searchQuery, selectedStaffIds, selectedRoles, showInactive]);

  const totalFilterCount = selectedStaffIds.length + selectedRoles.length + selectedStoreIds.length;

  /** 사용자 생성 핸들러 / Handle user creation */
  const handleCreate = useCallback(async (): Promise<void> => {
    if (
      !createForm.username.trim() ||
      !createForm.password.trim() ||
      !createForm.full_name.trim() ||
      !createForm.role_id
    )
      return;
    try {
      await createUser.mutateAsync({
        username: createForm.username.trim(),
        password: createForm.password,
        full_name: createForm.full_name.trim(),
        email: createForm.email.trim() || undefined,
        phone: createForm.phone.trim() || undefined,
        role_id: createForm.role_id,
      });
      toast({ type: "success", message: "Staff member created successfully!" });
      setIsCreateOpen(false);
      setCreateForm(INITIAL_FORM);
    } catch (err) {
      toast({ type: "error", message: parseApiError(err, "Failed to create staff member.") });
    }
  }, [createForm, createUser, toast]);

  /** 행 클릭으로 상세 페이지 이동 / Navigate to detail on row click */
  const handleRowClick = useCallback(
    (user: User): void => {
      router.push(`/users/${user.id}`);
    },
    [router],
  );

  /** 역할 뱃지 변형 결정 / Determine role badge variant */
  const getRoleBadgeVariant = useCallback(
    (roleName: string): "accent" | "warning" | "info" | "default" => {
      const name: string = roleName.toLowerCase();
      if (name === "owner") return "accent";
      if (name === "general_manager") return "warning";
      if (name === "supervisor") return "info";
      return "default";
    },
    [],
  );

  /** 테이블 컬럼 정의 / Table column definitions */
  const columns: Column<User>[] = useMemo(() => {
    const cols: Column<User>[] = [
      {
        key: "full_name",
        header: "Full Name",
        render: (user: User) => (
          <div>
            <p className="font-medium text-text">{user.full_name}</p>
            <p className="text-xs text-text-muted">@{user.username}</p>
          </div>
        ),
      },
      {
        key: "role_name",
        header: "Role",
        render: (user: User) => (
          <Badge variant={getRoleBadgeVariant(user.role_name)}>
            {user.role_name}
          </Badge>
        ),
      },
      {
        key: "email",
        header: "Email",
        hideOnMobile: true,
        render: (user: User) => (
          <span className="text-text-secondary text-sm flex items-center gap-1.5">
            {user.email || "-"}
            {user.email && (
              user.email_verified
                ? <span title="Verified" className="text-success text-xs">✓</span>
                : <span title="Not verified" className="text-warning text-xs">!</span>
            )}
          </span>
        ),
      },
    ];

    // Status 컬럼은 Show Inactive 켜졌을 때만 표시
    if (showInactive) {
      cols.push({
        key: "is_active",
        header: "Status",
        render: (user: User) => (
          <Badge variant={user.is_active ? "success" : "danger"}>
            {user.is_active ? "Active" : "Inactive"}
          </Badge>
        ),
      });
    }

    cols.push({
      key: "created_at",
      header: "Created",
      hideOnMobile: true,
      render: (user: User) => (
        <span className="text-text-muted text-xs">
          {formatDate(user.created_at, tz)}
        </span>
      ),
    });

    return cols;
  }, [getRoleBadgeVariant, tz, showInactive]);

  /** 고유 역할 이름 목록 / Unique role names from users */
  const uniqueRoleNames: string[] = useMemo(() => {
    const names: Set<string> = new Set(
      userList.map((user: User) => user.role_name),
    );
    return Array.from(names).sort();
  }, [userList]);

  /** Inactive 행 스타일 / Inactive row styling */
  const getRowClassName = useCallback(
    (user: User): string => (user.is_active ? "" : "opacity-50"),
    [],
  );

  if (usersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-text">Staff</h1>
        {canManageUsers && (
          <Button
            variant="primary"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Staff
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <div ref={filterRef} className="bg-surface border border-border rounded-xl px-4 py-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="w-48 rounded-lg border border-border bg-bg pl-8 pr-3 py-1.5 text-[12px] text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
            />
          </div>

          {/* Staff Multi-select */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenFilter(openFilter === "staff" ? null : "staff")}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border flex items-center gap-1.5 transition-colors ${
                selectedStaffIds.length > 0
                  ? "bg-accent-muted text-accent border-accent/30"
                  : "bg-surface text-text-secondary border-border hover:border-text-muted hover:text-text"
              } ${openFilter === "staff" ? "ring-2 ring-accent/20" : ""}`}
            >
              Staff
              {selectedStaffIds.length > 0 && (
                <span className="bg-accent text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{selectedStaffIds.length}</span>
              )}
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={`transition-transform ${openFilter === "staff" ? "rotate-180" : ""}`}><polyline points="2.5 4 5 6.5 7.5 4" /></svg>
            </button>
            {openFilter === "staff" && (
              <div className="absolute top-full left-0 mt-1.5 w-[300px] bg-surface border border-border rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] z-30 overflow-hidden">
                <div className="p-2 border-b border-border">
                  <div className="flex items-center gap-1.5 bg-bg border border-border rounded-lg px-3 py-1.5">
                    <Search className="h-3.5 w-3.5 text-text-muted" />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Search by name..."
                      value={staffSearch}
                      onChange={(e) => setStaffSearch(e.target.value)}
                      className="bg-transparent outline-none text-[13px] w-full text-text"
                    />
                    {staffSearch && (
                      <button type="button" onClick={() => setStaffSearch("")} className="text-text-muted hover:text-text">×</button>
                    )}
                  </div>
                </div>
                <div className="max-h-[280px] overflow-y-auto py-1">
                  {userList
                    .filter((u) => !staffSearch.trim() || (u.full_name ?? u.username).toLowerCase().includes(staffSearch.toLowerCase()))
                    .map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setSelectedStaffIds((prev) => prev.includes(u.id) ? prev.filter((id) => id !== u.id) : [...prev, u.id])}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-left transition-colors ${selectedStaffIds.includes(u.id) ? "bg-accent-muted" : "hover:bg-surface-hover"}`}
                    >
                      <span className={`w-4 h-4 rounded border-[1.5px] flex items-center justify-center shrink-0 transition-colors ${selectedStaffIds.includes(u.id) ? "bg-accent border-accent" : "border-border"}`}>
                        {selectedStaffIds.includes(u.id) && (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="2 5 4.5 7.5 8 3" /></svg>
                        )}
                      </span>
                      <span className="flex-1 font-medium text-text">{u.full_name || u.username}</span>
                      <span className="text-[10px] text-text-muted uppercase">{u.role_name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Role Multi-select */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenFilter(openFilter === "role" ? null : "role")}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border flex items-center gap-1.5 transition-colors ${
                selectedRoles.length > 0
                  ? "bg-accent-muted text-accent border-accent/30"
                  : "bg-surface text-text-secondary border-border hover:border-text-muted hover:text-text"
              } ${openFilter === "role" ? "ring-2 ring-accent/20" : ""}`}
            >
              Role
              {selectedRoles.length > 0 && (
                <span className="bg-accent text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{selectedRoles.length}</span>
              )}
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={`transition-transform ${openFilter === "role" ? "rotate-180" : ""}`}><polyline points="2.5 4 5 6.5 7.5 4" /></svg>
            </button>
            {openFilter === "role" && (
              <div className="absolute top-full left-0 mt-1.5 w-[200px] bg-surface border border-border rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] z-30 overflow-hidden py-1 max-h-[280px] overflow-y-auto">
                {uniqueRoleNames.map((roleName) => (
                  <button
                    key={roleName}
                    type="button"
                    onClick={() => setSelectedRoles((prev) => prev.includes(roleName) ? prev.filter((r) => r !== roleName) : [...prev, roleName])}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-left transition-colors ${selectedRoles.includes(roleName) ? "bg-accent-muted" : "hover:bg-surface-hover"}`}
                  >
                    <span className={`w-4 h-4 rounded border-[1.5px] flex items-center justify-center shrink-0 transition-colors ${selectedRoles.includes(roleName) ? "bg-accent border-accent" : "border-border"}`}>
                      {selectedRoles.includes(roleName) && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="2 5 4.5 7.5 8 3" /></svg>
                      )}
                    </span>
                    <span className="flex-1 font-medium text-text">{roleName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Store Multi-select */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenFilter(openFilter === "store" ? null : "store")}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border flex items-center gap-1.5 transition-colors ${
                selectedStoreIds.length > 0
                  ? "bg-accent-muted text-accent border-accent/30"
                  : "bg-surface text-text-secondary border-border hover:border-text-muted hover:text-text"
              } ${openFilter === "store" ? "ring-2 ring-accent/20" : ""}`}
            >
              Store
              {selectedStoreIds.length > 0 && (
                <span className="bg-accent text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{selectedStoreIds.length}</span>
              )}
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={`transition-transform ${openFilter === "store" ? "rotate-180" : ""}`}><polyline points="2.5 4 5 6.5 7.5 4" /></svg>
            </button>
            {openFilter === "store" && (
              <div className="absolute top-full left-0 mt-1.5 w-[240px] bg-surface border border-border rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] z-30 overflow-hidden py-1 max-h-[280px] overflow-y-auto">
                {stores.map((s: Store) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedStoreIds((prev) => prev.includes(s.id) ? prev.filter((id) => id !== s.id) : [...prev, s.id])}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-left transition-colors ${selectedStoreIds.includes(s.id) ? "bg-accent-muted" : "hover:bg-surface-hover"}`}
                  >
                    <span className={`w-4 h-4 rounded border-[1.5px] flex items-center justify-center shrink-0 transition-colors ${selectedStoreIds.includes(s.id) ? "bg-accent border-accent" : "border-border"}`}>
                      {selectedStoreIds.includes(s.id) && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="2 5 4.5 7.5 8 3" /></svg>
                      )}
                    </span>
                    <span className="flex-1 font-medium text-text">{s.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Show Inactive */}
          <label className="flex items-center gap-2 cursor-pointer text-[12px] text-text-secondary hover:text-text transition-colors select-none ml-auto">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleToggleInactive(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-border text-accent focus:ring-accent cursor-pointer"
            />
            Inactive
            {inactiveCount > 0 && <span className="text-text-muted text-[10px]">({inactiveCount})</span>}
          </label>

          {/* Clear All */}
          {(searchQuery || totalFilterCount > 0) && (
            <button
              type="button"
              onClick={() => { setSearchQuery(""); setSelectedStaffIds([]); setStaffSearch(""); setSelectedRoles([]); setSelectedStoreIds([]); setOpenFilter(null); }}
              className="text-[12px] text-text-muted hover:text-danger flex items-center gap-1 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="9" y1="3" x2="3" y2="9" /><line x1="3" y1="3" x2="9" y2="9" /></svg>
              Clear
            </button>
          )}
        </div>

        {/* Active filter chips */}
        {totalFilterCount > 0 && (
          <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-border flex-wrap">
            <span className="text-[11px] text-text-muted mr-1">Active:</span>
            {selectedStaffIds.map((id) => {
              const u = userList.find((x) => x.id === id);
              if (!u) return null;
              return (
                <span key={`u${id}`} className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent-muted text-accent rounded-full text-[11px] font-semibold">
                  {u.full_name || u.username}
                  <button type="button" onClick={() => setSelectedStaffIds((prev) => prev.filter((x) => x !== id))} className="opacity-60 hover:opacity-100 ml-0.5">×</button>
                </span>
              );
            })}
            {selectedRoles.map((r) => (
              <span key={`r${r}`} className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent-muted text-accent rounded-full text-[11px] font-semibold">
                {r}
                <button type="button" onClick={() => setSelectedRoles((prev) => prev.filter((x) => x !== r))} className="opacity-60 hover:opacity-100 ml-0.5">×</button>
              </span>
            ))}
            {selectedStoreIds.map((id) => {
              const s = stores.find((st) => st.id === id);
              return (
                <span key={`s${id}`} className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent-muted text-accent rounded-full text-[11px] font-semibold">
                  {s?.name ?? id}
                  <button type="button" onClick={() => setSelectedStoreIds((prev) => prev.filter((x) => x !== id))} className="opacity-60 hover:opacity-100 ml-0.5">×</button>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Users Table */}
      <Table<User>
        columns={columns}
        data={filteredUsers}
        isLoading={usersLoading}
        onRowClick={handleRowClick}
        emptyMessage="No staff members found."
        rowClassName={showInactive ? getRowClassName : undefined}
      />

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setCreateForm(INITIAL_FORM);
        }}
        title="Add Staff Member"
      >
        <div className="space-y-4">
          <Input
            label="Username"
            placeholder="Enter username"
            value={createForm.username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setCreateForm((prev: UserFormData) => ({
                ...prev,
                username: e.target.value,
              }))
            }
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter password"
            value={createForm.password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setCreateForm((prev: UserFormData) => ({
                ...prev,
                password: e.target.value,
              }))
            }
          />
          <Input
            label="Full Name"
            placeholder="Enter full name"
            value={createForm.full_name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setCreateForm((prev: UserFormData) => ({
                ...prev,
                full_name: e.target.value,
              }))
            }
          />
          <Input
            label="Email (optional)"
            type="email"
            placeholder="Enter email"
            value={createForm.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setCreateForm((prev: UserFormData) => ({
                ...prev,
                email: e.target.value,
              }))
            }
          />
          <Input
            label="Phone (optional)"
            type="tel"
            placeholder="Enter phone number"
            value={createForm.phone}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setCreateForm((prev: UserFormData) => ({
                ...prev,
                phone: e.target.value,
              }))
            }
          />
          <Select
            label="Role"
            options={[
              { value: "", label: "Select a role" },
              ...roleList.map((role: Role) => ({
                value: role.id,
                label: role.name,
              })),
            ]}
            value={createForm.role_id}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setCreateForm((prev: UserFormData) => ({
                ...prev,
                role_id: e.target.value,
              }))
            }
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setIsCreateOpen(false);
                setCreateForm(INITIAL_FORM);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreate}
              isLoading={createUser.isPending}
              disabled={
                !createForm.username.trim() ||
                !createForm.password.trim() ||
                !createForm.full_name.trim() ||
                !createForm.role_id
              }
            >
              Create
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
