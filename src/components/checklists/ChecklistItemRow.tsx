"use client";

/**
 * 체크리스트 아이템 행 컴포넌트 -- 인스턴스 상세에서 개별 아이템을 표시합니다.
 *
 * Individual checklist item row in the instance detail view.
 * Shows completion status, verification data (photo/note), timestamp,
 * and review controls (O/X/△ + comment + photo).
 */

import React, { useState } from "react";
import {
  Check,
  X,
  Clock,
  Camera,
  FileText,
  MapPin,
  Trash2,
} from "lucide-react";
import { Badge, Textarea, ImageUpload } from "@/components/ui";
import { cn, formatActionTime } from "@/lib/utils";
import {
  useUpsertItemReview,
  useDeleteItemReview,
} from "@/hooks/useChecklistInstances";
import type {
  ChecklistInstanceSnapshotItem,
  ChecklistCompletion,
} from "@/types";

interface ChecklistItemRowProps {
  item: ChecklistInstanceSnapshotItem;
  index: number;
  completion: ChecklistCompletion | undefined;
  workDate: string;
  instanceId?: string;
}

const REVIEW_OPTIONS = [
  { value: "pass", label: "O" },
  { value: "fail", label: "X" },
  { value: "caution", label: "△" },
] as const;

export function ChecklistItemRow({
  item,
  index,
  completion,
  workDate,
  instanceId,
}: ChecklistItemRowProps): React.ReactElement {
  const isCompleted: boolean = !!completion;
  const [isPhotoExpanded, setIsPhotoExpanded] = useState(false);

  // Review state
  const review = item.review;
  const [isEditing, setIsEditing] = useState(false);
  const [editResult, setEditResult] = useState<string>(review?.result ?? "");
  const [editComment, setEditComment] = useState<string>(
    review?.comment ?? "",
  );
  const [editPhotoUrl, setEditPhotoUrl] = useState<string | null>(
    review?.photo_url ?? null,
  );

  const upsertReview = useUpsertItemReview();
  const deleteReview = useDeleteItemReview();

  const handleResultClick = (result: string) => {
    if (!instanceId) return;
    setEditResult(result);
    setEditComment(review?.comment ?? "");
    setEditPhotoUrl(review?.photo_url ?? null);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!instanceId || !editResult) return;
    upsertReview.mutate(
      {
        instanceId,
        itemIndex: item.item_index,
        result: editResult,
        comment: editComment || null,
        photo_url: editPhotoUrl,
      },
      { onSuccess: () => setIsEditing(false) },
    );
  };

  const handleDelete = () => {
    if (!instanceId) return;
    deleteReview.mutate(
      { instanceId, itemIndex: item.item_index },
      { onSuccess: () => setIsEditing(false) },
    );
  };

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
          {/* Review badge */}
          {review && !isEditing && (
            <Badge
              variant={
                review.result === "pass"
                  ? "success"
                  : review.result === "fail"
                    ? "danger"
                    : "warning"
              }
            >
              {review.result === "pass"
                ? "O"
                : review.result === "fail"
                  ? "X"
                  : "△"}
            </Badge>
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

        {/* Review section */}
        {instanceId && (
          <div className="mt-2 ml-6">
            {/* Existing review display (not editing) */}
            {review && !isEditing && (
              <div className="space-y-1 text-xs text-text-muted">
                {review.comment && (
                  <p className="text-text-secondary">{review.comment}</p>
                )}
                {review.photo_url && (
                  <img
                    src={review.photo_url}
                    alt="Review photo"
                    className="w-16 h-16 object-cover rounded border border-border"
                  />
                )}
                <div className="flex items-center gap-2">
                  <span>
                    Reviewed by {review.reviewer_name ?? "Unknown"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditResult(review.result);
                      setEditComment(review.comment ?? "");
                      setEditPhotoUrl(review.photo_url);
                      setIsEditing(true);
                    }}
                    className="text-accent hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="text-danger hover:underline"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            )}

            {/* Review buttons (no review yet, not editing) */}
            {!review && !isEditing && (
              <div className="flex items-center gap-1.5">
                {REVIEW_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleResultClick(opt.value)}
                    className={cn(
                      "w-7 h-7 rounded-md text-xs font-bold border flex items-center justify-center",
                      opt.value === "pass" &&
                        "border-success/40 text-success hover:bg-success/10",
                      opt.value === "fail" &&
                        "border-danger/40 text-danger hover:bg-danger/10",
                      opt.value === "caution" &&
                        "border-warning/40 text-warning hover:bg-warning/10",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {/* Editing form */}
            {isEditing && (
              <div className="space-y-2 p-2 rounded-lg border border-accent/30 bg-accent/5">
                {/* Result selection */}
                <div className="flex items-center gap-1.5">
                  {REVIEW_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setEditResult(opt.value)}
                      className={cn(
                        "w-7 h-7 rounded-md text-xs font-bold border flex items-center justify-center",
                        editResult === opt.value
                          ? opt.value === "pass"
                            ? "bg-success text-white border-success"
                            : opt.value === "fail"
                              ? "bg-danger text-white border-danger"
                              : "bg-warning text-white border-warning"
                          : "border-border text-text-muted hover:bg-surface-hover",
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Comment */}
                <Textarea
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  placeholder="Comment (optional)"
                  className="text-xs min-h-[60px]"
                />

                {/* Photo */}
                <ImageUpload
                  value={editPhotoUrl}
                  onUpload={(url) => setEditPhotoUrl(url)}
                  onRemove={() => setEditPhotoUrl(null)}
                />

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!editResult || upsertReview.isPending}
                    className="px-3 py-1 text-xs font-medium rounded-md bg-accent text-white hover:bg-accent/90 disabled:opacity-50"
                  >
                    {upsertReview.isPending ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1 text-xs rounded-md text-text-muted hover:bg-surface-hover"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
