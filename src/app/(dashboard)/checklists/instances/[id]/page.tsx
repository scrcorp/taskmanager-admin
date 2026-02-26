"use client";

/**
 * 체크리스트 인스턴스 상세 페이지 -- 인스턴스의 전체 항목 및 완료 상태를 표시합니다.
 * 하단에 코멘트 섹션을 포함합니다.
 *
 * Checklist instance detail page showing full item list with completion data.
 * Includes a comments section at the bottom.
 */

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Send, MessageSquare } from "lucide-react";
import {
  useChecklistInstance,
  useChecklistComments,
  useCreateChecklistComment,
} from "@/hooks/useChecklistInstances";
import { Button, Card, Input, LoadingSpinner, EmptyState, useToast } from "@/components/ui";
import { ChecklistInstanceDetail } from "@/components/checklists/ChecklistInstanceDetail";
import { formatDateTime, parseApiError } from "@/lib/utils";
import type { ChecklistInstanceComment } from "@/types";

export default function ChecklistInstanceDetailPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const instanceId: string = params.id as string;
  const { data: instance, isLoading } = useChecklistInstance(instanceId);
  const {
    data: comments,
    isLoading: commentsLoading,
  } = useChecklistComments(instanceId);
  const createComment = useCreateChecklistComment();

  const [commentText, setCommentText] = useState<string>("");

  const handleSubmitComment = async (): Promise<void> => {
    const trimmed: string = commentText.trim();
    if (!trimmed) return;

    try {
      await createComment.mutateAsync({
        instanceId,
        text: trimmed,
      });
      setCommentText("");
      toast({ type: "success", message: "Comment added." });
    } catch (err) {
      toast({ type: "error", message: parseApiError(err, "Failed to add comment.") });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!instance) {
    return (
      <div>
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ChevronLeft size={16} />
          Back
        </Button>
        <EmptyState message="Checklist instance not found." />
      </div>
    );
  }

  return (
    <div>
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        onClick={() => router.back()}
      >
        <ChevronLeft size={16} />
        Back to Checklist Instances
      </Button>

      <ChecklistInstanceDetail instance={instance} />

      {/* Comments Section */}
      <Card className="mt-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare size={18} className="text-text-muted" />
          <h2 className="text-lg font-semibold text-text">Comments</h2>
        </div>

        {/* Comment list */}
        {commentsLoading ? (
          <div className="flex items-center justify-center py-6">
            <LoadingSpinner size="sm" />
          </div>
        ) : !comments || comments.length === 0 ? (
          <p className="text-sm text-text-muted py-4">No comments yet.</p>
        ) : (
          <div className="space-y-3 mb-4">
            {comments.map((comment: ChecklistInstanceComment) => (
              <div
                key={comment.id}
                className="rounded-lg bg-surface p-3"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-text">
                    {comment.user_name ?? "Unknown"}
                  </span>
                  <span className="text-xs text-text-muted">
                    {formatDateTime(comment.created_at)}
                  </span>
                </div>
                <p className="text-sm text-text-secondary">{comment.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* Add comment input */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Input
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setCommentText(e.target.value)
            }
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmitComment();
              }
            }}
            className="flex-1"
          />
          <Button
            size="sm"
            onClick={handleSubmitComment}
            disabled={!commentText.trim() || createComment.isPending}
          >
            <Send size={16} />
          </Button>
        </div>
      </Card>
    </div>
  );
}
