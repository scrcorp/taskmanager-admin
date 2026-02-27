"use client";

/**
 * 리뷰 콘텐츠 채팅 모달 — 리뷰 항목의 콘텐츠를 채팅 형태로 표시하고 추가할 수 있습니다.
 */

import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Loader2, Film, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { useAddReviewContent, useDeleteReviewContent, usePresignedUrl } from "@/hooks/useChecklistInstances";
import { useAuthStore } from "@/stores/authStore";
import { parseApiError } from "@/lib/utils";
import type { ReviewContent } from "@/types";

interface ReviewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  instanceId: string;
  itemIndex: number;
  itemTitle: string;
  reviewResult: string;
  contents: ReviewContent[];
}

function isVideo(url: string): boolean {
  return /\.(mp4|mov|webm|avi|mkv)(\?|$)/i.test(url);
}

function formatChatTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ReviewChatModal({
  isOpen,
  onClose,
  instanceId,
  itemIndex,
  itemTitle,
  reviewResult,
  contents,
}: ReviewChatModalProps): React.ReactElement | null {
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);
  const addContent = useAddReviewContent();
  const deleteContent = useDeleteReviewContent();
  const presignedUrl = usePresignedUrl();

  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 스크롤 하단 유지
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [isOpen, contents.length]);

  const resultLabel = reviewResult === "pass" ? "O" : reviewResult === "fail" ? "X" : "△";

  const handleSendText = async () => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    try {
      await addContent.mutateAsync({
        instanceId,
        itemIndex,
        type: "text",
        content: trimmed,
      });
      setText("");
    } catch (err) {
      toast({ type: "error", message: parseApiError(err, "Failed to send.") });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const { upload_url, file_url } = await presignedUrl.mutateAsync({
        filename: file.name,
        content_type: file.type,
      });
      await fetch(upload_url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      const type = file.type.startsWith("video/") ? "video" : "photo";
      await addContent.mutateAsync({
        instanceId,
        itemIndex,
        type,
        content: file_url,
      });
    } catch (err) {
      toast({ type: "error", message: parseApiError(err, "Failed to upload.") });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (contentId: string) => {
    try {
      await deleteContent.mutateAsync({ instanceId, itemIndex, contentId });
    } catch (err) {
      toast({ type: "error", message: parseApiError(err, "Failed to delete.") });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Review — ${itemTitle}`} size="md">
      {/* 리뷰 결과 표시 */}
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
        <span className="text-xs text-text-muted">Result:</span>
        <span className={`text-sm font-bold ${
          reviewResult === "pass" ? "text-success" : reviewResult === "fail" ? "text-danger" : "text-warning"
        }`}>
          {resultLabel}
        </span>
      </div>

      {/* 채팅 영역 */}
      <div className="max-h-[400px] overflow-y-auto space-y-3 mb-4">
        {contents.length === 0 && (
          <p className="text-sm text-text-muted text-center py-8">No comments yet.</p>
        )}
        {contents.map((c) => {
          const isMe = user?.id === c.author_id;
          return (
            <div key={c.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] ${isMe ? "items-end" : "items-start"}`}>
                {/* 작성자 이름 */}
                <p className={`text-[10px] text-text-muted mb-0.5 ${isMe ? "text-right" : "text-left"}`}>
                  {c.author_name ?? "Unknown"}
                </p>
                {/* 콘텐츠 버블 */}
                <div className={`relative group rounded-lg px-3 py-2 ${
                  isMe ? "bg-accent/10 text-text" : "bg-surface-hover text-text"
                }`}>
                  {c.type === "text" ? (
                    <p className="text-sm whitespace-pre-wrap break-words">{c.content}</p>
                  ) : c.type === "video" || isVideo(c.content) ? (
                    <video src={c.content} controls className="max-w-full max-h-[200px] rounded" />
                  ) : (
                    <img src={c.content} alt="Review media" className="max-w-full max-h-[200px] rounded" />
                  )}
                  {/* 삭제 버튼 (본인 콘텐츠만) */}
                  {isMe && (
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      className="absolute -top-1 -right-1 hidden group-hover:flex w-5 h-5 rounded-full bg-danger text-white items-center justify-center"
                    >
                      <Trash2 size={10} />
                    </button>
                  )}
                </div>
                {/* 시간 */}
                <p className={`text-[10px] text-text-muted mt-0.5 ${isMe ? "text-right" : "text-left"}`}>
                  {formatChatTime(c.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="flex items-end gap-2 border-t border-border pt-3">
        {/* 파일 첨부 */}
        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-lg text-text-muted hover:text-text-secondary hover:bg-surface-hover disabled:opacity-50"
        >
          {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Paperclip size={18} />}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
          }}
        />
        {/* 텍스트 입력 */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
        />
        {/* 전송 */}
        <button
          type="button"
          disabled={!text.trim() || isSending}
          onClick={handleSendText}
          className="p-2 rounded-lg bg-accent text-white hover:bg-accent/80 disabled:opacity-50"
        >
          {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>
    </Modal>
  );
}
