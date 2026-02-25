"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { getCompanyCode, setCompanyCode } from "@/lib/auth";

interface CompanyCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (code: string) => void;
}

export function CompanyCodeModal({
  isOpen,
  onClose,
  onSave,
}: CompanyCodeModalProps) {
  const [code, setCode] = useState("");

  useEffect(() => {
    if (isOpen) {
      const saved = getCompanyCode();
      if (saved) setCode(saved);
    }
  }, [isOpen]);

  const handleSave = () => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length !== 6) return;
    setCompanyCode(trimmed);
    onSave(trimmed);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Company Code" size="sm">
      <div className="flex flex-col gap-4">
        <p className="text-text-secondary text-sm">
          Enter the 6-digit company code to connect to your organization.
        </p>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
          placeholder="ABC123"
          maxLength={6}
          className="w-full px-4 py-3 rounded-lg border border-border bg-surface text-text text-center text-2xl font-bold tracking-[0.3em] outline-none focus:border-accent"
        />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-border text-text-secondary text-sm font-medium hover:bg-surface-hover transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={code.trim().length !== 6}
            className="flex-1 py-2.5 rounded-lg bg-accent text-white text-sm font-bold hover:bg-accent-light disabled:opacity-50 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
}
