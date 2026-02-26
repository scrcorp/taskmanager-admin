"use client";

/**
 * 스태프 상세 페이지 -- 사용자 프로필, 수정, 활성/비활성 토글, 삭제, 매장 할당을 관리합니다.
 *
 * Staff Detail Page -- Manages user profile, editing, active toggle,
 * deletion, and store assignments.
 */

import React, { useState, useMemo, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ChevronLeft,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Plus,
  Store as StoreIcon,
  X,
} from "lucide-react";
import {
  useUser,
  useUpdateUser,
  useToggleUserActive,
  useDeleteUser,
  useUserStores,
  useAddUserStore,
  useRemoveUserStore,
} from "@/hooks/useUsers";
import { useStores } from "@/hooks/useStores";
import { useRoles } from "@/hooks/useRoles";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge, Modal, Select, ConfirmDialog } from "@/components/ui";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useToast } from "@/components/ui/Toast";
import { formatDate, parseApiError } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/lib/permissions";
import type { User, Store, Role } from "@/types";

/* -------------------------------------------------------------------------- */
/*  Type Definitions                                                          */
/* -------------------------------------------------------------------------- */

/** 사용자 수정 폼 데이터 / User edit form data */
interface UserEditFormData {
  full_name: string;
  email: string;
  phone: string;
  role_id: string;
}

/** useUserStores returns Store[] from the hooks */

/* -------------------------------------------------------------------------- */
/*  Constants                                                                 */
/* -------------------------------------------------------------------------- */

const INITIAL_EDIT_FORM: UserEditFormData = {
  full_name: "",
  email: "",
  phone: "",
  role_id: "",
};

/* -------------------------------------------------------------------------- */
/*  Main Component                                                            */
/* -------------------------------------------------------------------------- */

export default function UserDetailPage(): React.ReactElement {
  const router = useRouter();
  const params = useParams();
  const userId: string = params.id as string;
  const { toast } = useToast();
  const { hasPermission } = usePermissions();
  const canManageUsers = hasPermission(PERMISSIONS.USERS_UPDATE);

  /* ---- Data hooks -------------------------------------------------------- */
  const { data: user, isLoading: userLoading } = useUser(userId);
  const { data: userStores, isLoading: storesLoading } =
    useUserStores(userId);
  const { data: allStores } = useStores();
  const { data: roles } = useRoles();

  /* ---- Mutation hooks ---------------------------------------------------- */
  const updateUser = useUpdateUser();
  const toggleActive = useToggleUserActive();
  const deleteUser = useDeleteUser();
  const addUserStore = useAddUserStore();
  const removeUserStore = useRemoveUserStore();

  /* ---- Edit modal state -------------------------------------------------- */
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [editForm, setEditForm] =
    useState<UserEditFormData>(INITIAL_EDIT_FORM);

  /* ---- Delete dialog state ----------------------------------------------- */
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);

  /* ---- Role change confirmation state ----------------------------------- */
  const [isRoleChangeOpen, setIsRoleChangeOpen] = useState<boolean>(false);

  /* ---- Store assignment state -------------------------------------------- */
  const [isAssignOpen, setIsAssignOpen] = useState<boolean>(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [removingStoreId, setRemovingStoreId] = useState<string | null>(null);
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] =
    useState<boolean>(false);
  const [removingStoreName, setRemovingStoreName] = useState<string>("");

  /* ---- Derived data ------------------------------------------------------ */

  const userStoreList: Store[] = useMemo(
    () => (Array.isArray(userStores) ? userStores : []),
    [userStores],
  );

  const allStoreList: Store[] = useMemo(
    () => (Array.isArray(allStores) ? allStores : []),
    [allStores],
  );

  const roleList: Role[] = useMemo(
    () => (Array.isArray(roles) ? roles : []),
    [roles],
  );

  /** 아직 할당되지 않은 매장 목록 / Stores not yet assigned */
  const availableStores: Store[] = useMemo(() => {
    const assignedIds: Set<string> = new Set(
      userStoreList.map((us: Store) => us.id),
    );
    return allStoreList.filter(
      (store: Store) => !assignedIds.has(store.id),
    );
  }, [allStoreList, userStoreList]);

  /* ======================================================================== */
  /*  Handlers                                                                */
  /* ======================================================================== */

  /** 수정 모달 열기 / Open edit modal */
  const handleOpenEdit = useCallback((): void => {
    if (!user) return;
    setEditForm({
      full_name: user.full_name,
      email: user.email || "",
      phone: user.phone || "",
      role_id: "",
    });
    setIsEditOpen(true);
  }, [user]);

  /** 사용자 수정 저장 (역할 변경 확인 포함) / Save user edits (with role change check) */
  const handleSaveClick = useCallback((): void => {
    if (!editForm.full_name.trim()) return;
    // If role is being changed, show confirmation first
    if (editForm.role_id && user) {
      const currentRole = roleList.find((r: Role) => r.name === user.role_name);
      if (currentRole && editForm.role_id !== currentRole.id) {
        setIsRoleChangeOpen(true);
        return;
      }
    }
    handleUpdate();
  }, [editForm, user, roleList]);

  /** 사용자 수정 저장 / Save user edits */
  const handleUpdate = useCallback(async (): Promise<void> => {
    if (!editForm.full_name.trim()) return;
    try {
      const payload: {
        id: string;
        full_name: string;
        email?: string;
        phone?: string;
        role_id?: string;
      } = {
        id: userId,
        full_name: editForm.full_name.trim(),
        email: editForm.email.trim() || undefined,
        phone: editForm.phone.trim() || undefined,
      };
      if (editForm.role_id) {
        payload.role_id = editForm.role_id;
      }
      await updateUser.mutateAsync(payload);
      toast({ type: "success", message: "Staff member updated successfully!" });
      setIsEditOpen(false);
      setIsRoleChangeOpen(false);
      setEditForm(INITIAL_EDIT_FORM);
    } catch (err) {
      toast({ type: "error", message: parseApiError(err, "Failed to update staff member.") });
    }
  }, [userId, editForm, updateUser, toast]);

  /** 활성/비활성 토글 / Toggle active status */
  const handleToggleActive = useCallback(async (): Promise<void> => {
    try {
      await toggleActive.mutateAsync({
        id: userId,
        is_active: !user?.is_active,
      });
      toast({
        type: "success",
        message: user?.is_active
          ? "Staff member deactivated."
          : "Staff member activated.",
      });
    } catch (err) {
      toast({ type: "error", message: parseApiError(err, "Failed to toggle active status.") });
    }
  }, [userId, user, toggleActive, toast]);

  /** 사용자 삭제 / Delete user */
  const handleDelete = useCallback(async (): Promise<void> => {
    try {
      await deleteUser.mutateAsync(userId);
      toast({ type: "success", message: "Staff member deleted successfully!" });
      router.push("/users");
    } catch (err) {
      toast({ type: "error", message: parseApiError(err, "Failed to delete staff member.") });
    }
  }, [userId, deleteUser, toast, router]);

  /** 매장 할당 / Assign store */
  const handleAssignStore = useCallback(async (): Promise<void> => {
    if (!selectedStoreId) return;
    try {
      await addUserStore.mutateAsync({
        userId,
        storeId: selectedStoreId,
      });
      toast({ type: "success", message: "Store assigned successfully!" });
      setIsAssignOpen(false);
      setSelectedStoreId("");
    } catch (err) {
      toast({ type: "error", message: parseApiError(err, "Failed to assign store.") });
    }
  }, [userId, selectedStoreId, addUserStore, toast]);

  /** 매장 할당 해제 확인 열기 / Open remove store confirmation */
  const handleOpenRemoveStore = useCallback(
    (store: Store): void => {
      setRemovingStoreId(store.id);
      setRemovingStoreName(store.name);
      setIsRemoveConfirmOpen(true);
    },
    [],
  );

  /** 매장 할당 해제 / Remove store assignment */
  const handleRemoveStore = useCallback(async (): Promise<void> => {
    if (!removingStoreId) return;
    try {
      await removeUserStore.mutateAsync({
        userId,
        storeId: removingStoreId,
      });
      toast({ type: "success", message: "Store assignment removed." });
      setIsRemoveConfirmOpen(false);
      setRemovingStoreId(null);
      setRemovingStoreName("");
    } catch (err) {
      toast({ type: "error", message: parseApiError(err, "Failed to remove store assignment.") });
    }
  }, [userId, removingStoreId, removeUserStore, toast]);

  /** 역할 뱃지 변형 결정 / Determine role badge variant */
  const getRoleBadgeVariant = useCallback(
    (roleName: string): "accent" | "warning" | "default" => {
      const name: string = roleName.toLowerCase();
      if (name.includes("admin") || name.includes("super")) return "accent";
      if (name.includes("manager")) return "warning";
      return "default";
    },
    [],
  );

  /* ======================================================================== */
  /*  Loading & Error States                                                  */
  /* ======================================================================== */

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Staff member not found.</p>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => router.push("/users")}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Staff
        </Button>
      </div>
    );
  }

  /* ======================================================================== */
  /*  Render                                                                  */
  /* ======================================================================== */

  return (
    <div>
      {/* Back Navigation */}
      <button
        type="button"
        onClick={() => router.push("/users")}
        className="flex items-center gap-1 text-sm text-text-secondary hover:text-text transition-colors mb-4"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Staff
      </button>

      {/* User Profile Card */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-accent-muted text-accent text-xl font-bold flex-shrink-0">
              {user.full_name.charAt(0).toUpperCase()}
            </div>

            {/* User Info */}
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-extrabold text-text">
                  {user.full_name}
                </h1>
                <Badge variant={getRoleBadgeVariant(user.role_name)}>
                  {user.role_name}
                </Badge>
                <Badge variant={user.is_active ? "success" : "danger"}>
                  {user.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-sm text-text-muted mb-3">
                @{user.username}
              </p>

              {/* Detail Grid */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                <div>
                  <span className="text-xs text-text-muted block">
                    Email
                  </span>
                  <span className="text-sm text-text-secondary">
                    {user.email || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-text-muted block">
                    Phone
                  </span>
                  <span className="text-sm text-text-secondary">
                    {user.phone || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-text-muted block">
                    Created
                  </span>
                  <span className="text-sm text-text-secondary">
                    {formatDate(user.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {canManageUsers && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button variant="secondary" size="sm" onClick={handleOpenEdit}>
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleActive}
                isLoading={toggleActive.isPending}
              >
                {user.is_active ? (
                  <>
                    <ToggleRight className="h-4 w-4" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <ToggleLeft className="h-4 w-4" />
                    Activate
                  </>
                )}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setIsDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Store Assignments Section */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text">
            Store Assignments
          </h2>
          {canManageUsers && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAssignOpen(true)}
              disabled={availableStores.length === 0}
            >
              <Plus className="h-4 w-4" />
              Assign Store
            </Button>
          )}
        </div>

        {storesLoading ? (
          <div className="flex items-center justify-center h-16">
            <LoadingSpinner size="sm" />
          </div>
        ) : userStoreList.length === 0 ? (
          <div className="text-center py-6">
            <StoreIcon className="h-8 w-8 text-text-muted mx-auto mb-2" />
            <p className="text-sm text-text-muted">
              No stores assigned yet. Assign a store to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {userStoreList.map((store: Store) => (
              <div
                key={store.id}
                className="flex items-center justify-between bg-surface border border-border rounded-lg px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-accent-muted text-accent">
                    <StoreIcon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-text">
                    {store.name}
                  </span>
                </div>
                {canManageUsers && (
                  <button
                    type="button"
                    onClick={() => handleOpenRemoveStore(store)}
                    className="p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-danger-muted transition-colors"
                    aria-label={`Remove ${store.name} assignment`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Assignments Section (Placeholder) */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-bold text-text mb-4">
          Recent Assignments
        </h2>
        <div className="text-center py-6">
          <p className="text-sm text-text-muted">
            Recent assignment history will be displayed here.
          </p>
        </div>
      </div>

      {/* ================================================================== */}
      {/*  Modals & Dialogs                                                  */}
      {/* ================================================================== */}

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditForm(INITIAL_EDIT_FORM);
        }}
        title="Edit Staff Member"
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Enter full name"
            value={editForm.full_name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEditForm((prev: UserEditFormData) => ({
                ...prev,
                full_name: e.target.value,
              }))
            }
          />
          <Input
            label="Email (optional)"
            type="email"
            placeholder="Enter email"
            value={editForm.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEditForm((prev: UserEditFormData) => ({
                ...prev,
                email: e.target.value,
              }))
            }
          />
          <Input
            label="Phone (optional)"
            type="tel"
            placeholder="Enter phone number"
            value={editForm.phone}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEditForm((prev: UserEditFormData) => ({
                ...prev,
                phone: e.target.value,
              }))
            }
          />
          <Select
            label="Role (optional - leave empty to keep current)"
            options={[
              { value: "", label: "Keep current role" },
              ...roleList.map((role: Role) => ({
                value: role.id,
                label: role.name,
              })),
            ]}
            value={editForm.role_id}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setEditForm((prev: UserEditFormData) => ({
                ...prev,
                role_id: e.target.value,
              }))
            }
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setIsEditOpen(false);
                setEditForm(INITIAL_EDIT_FORM);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdate}
              isLoading={updateUser.isPending}
              disabled={!editForm.full_name.trim()}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Staff Member"
        message={`Are you sure you want to delete "${user.full_name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={deleteUser.isPending}
      />

      {/* Assign Store Modal */}
      <Modal
        isOpen={isAssignOpen}
        onClose={() => {
          setIsAssignOpen(false);
          setSelectedStoreId("");
        }}
        title="Assign Store"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Select a store to assign to {user.full_name}.
          </p>
          <Select
            label="Store"
            options={[
              { value: "", label: "Select a store" },
              ...availableStores.map((store: Store) => ({
                value: store.id,
                label: store.name,
              })),
            ]}
            value={selectedStoreId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setSelectedStoreId(e.target.value)
            }
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setIsAssignOpen(false);
                setSelectedStoreId("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAssignStore}
              isLoading={addUserStore.isPending}
              disabled={!selectedStoreId}
            >
              Assign
            </Button>
          </div>
        </div>
      </Modal>

      {/* Remove Store Assignment Confirmation */}
      <ConfirmDialog
        isOpen={isRemoveConfirmOpen}
        onClose={() => {
          setIsRemoveConfirmOpen(false);
          setRemovingStoreId(null);
          setRemovingStoreName("");
        }}
        onConfirm={handleRemoveStore}
        title="Remove Store Assignment"
        message={`Are you sure you want to remove "${removingStoreName}" from ${user.full_name}?`}
        confirmLabel="Remove"
        isLoading={removeUserStore.isPending}
      />
    </div>
  );
}
