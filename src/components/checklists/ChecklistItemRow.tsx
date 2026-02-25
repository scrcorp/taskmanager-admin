"use client";

/**
 * 체크리스트 아이템 행 컴포넌트 -- 인스턴스 상세에서 개별 아이템을 표시합니다.
 *
 * Individual checklist item row in the instance detail view.
 * Shows completion status, verification data (photo/note), and timestamp.
 */

import React, { useState } from "react";
import { Check, X, Clock, Camera, FileText, MapPin } from "lucide-react";
import { Badge } from "@/components/ui";
import { cn, formatActionTime } from "@/lib/utils";
import type {
  ChecklistInstanceSnapshotItem,
  ChecklistCompletion,
} from "@/types";

interface ChecklistItemRowProps {
  item: ChecklistInstanceSnapshotItem;
  index: number;
  completion: ChecklistCompletion | undefined;
  workDate: string;
}

export function ChecklistItemRow({
  item,
  index,
  completion,
  workDate,
}: ChecklistItemRowProps): React.ReactElement {
  const isCompleted: boolean = !!completion;
  const [isPhotoExpanded, setIsPhotoExpanded] = useState<boolean>(false);

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg border border-border",
        isCompleted ? "bg-success-muted/30" : "bg-surface",
      )}
    >
      {/* Completion icon */}
      <div
        className={cn(
          "mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center",
          isCompleted
            ? "bg-success text-white"
            : "bg-surface-hover text-text-muted",
        )}
      >
        {isCompleted ? <Check size={12} /> : <X size={12} />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-text-muted">
            {index + 1}.
          </span>
          <span className="text-sm font-medium text-text">{item.title}</span>
          {item.verification_type !== "none" && (
            <Badge variant="accent">{item.verification_type}</Badge>
          )}
        </div>

        {item.description && (
          <p className="text-xs text-text-secondary mt-1 ml-6">
            {item.description}
          </p>
        )}

        {/* Completion details */}
        {completion && (
          <div className="mt-2 ml-6 space-y-1.5">
            {/* Completer and time */}
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <Clock size={11} />
              <span>
                {formatActionTime(completion.completed_at, workDate)}
              </span>
              {completion.user_name && (
                <>
                  <span>by</span>
                  <span className="text-text-secondary font-medium">
                    {completion.user_name}
                  </span>
                </>
              )}
            </div>

            {/* Photo thumbnail */}
            {completion.photo_url && (
              <div className="flex items-start gap-2">
                <Camera size={11} className="text-accent mt-0.5 shrink-0" />
                <button
                  type="button"
                  onClick={() => setIsPhotoExpanded(!isPhotoExpanded)}
                  className="text-xs text-accent hover:underline cursor-pointer"
                >
                  {isPhotoExpanded ? "Hide photo" : "View photo"}
                </button>
              </div>
            )}
            {isPhotoExpanded && completion.photo_url && (
              <div className="ml-0 mt-1">
                <img
                  src={completion.photo_url}
                  alt={`Verification for ${item.title}`}
                  className="max-w-[240px] rounded-lg border border-border"
                />
              </div>
            )}

            {/* Note */}
            {completion.note && (
              <div className="flex items-start gap-2">
                <FileText size={11} className="text-warning mt-0.5 shrink-0" />
                <p className="text-xs text-text-secondary">{completion.note}</p>
              </div>
            )}

            {/* Location */}
            {completion.location && (
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <MapPin size={11} className="shrink-0" />
                <span>
                  {completion.location.lat.toFixed(4)},{" "}
                  {completion.location.lng.toFixed(4)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
