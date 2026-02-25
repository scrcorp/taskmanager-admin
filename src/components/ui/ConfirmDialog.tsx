"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";

/**
 * 확인 대화상자 컴포넌트 -- 위험한 작업 전 사용자 확인을 요청합니다.
 *
 * Confirmation dialog component for confirming destructive or important actions.
 *
 * @param isOpen - 대화상자 표시 여부 (Whether the dialog is visible)
 * @param onClose - 대화상자 닫기 핸들러 (Handler called when dialog should close)
 * @param onConfirm - 확인 버튼 핸들러 (Handler called when user confirms)
 * @param title - 대화상자 제목 (Dialog title)
 * @param message - 확인 메시지 (Confirmation message)
 * @param confirmLabel - 확인 버튼 텍스트 (Confirm button text)
 * @param isLoading - 확인 진행 중 표시 (Whether confirm action is in progress)
 */

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message,
  confirmLabel = "Confirm",
  isLoading = false,
}: ConfirmDialogProps): React.ReactElement | null {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-danger-muted flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-danger" />
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">{message}</p>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
