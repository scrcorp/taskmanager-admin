"use client";

import { Phase2Banner } from "./Phase2Banner";
import {
  MOCK_APPLICANTS,
  type ApplicantStageMock,
} from "./_phase2Mock";

const STAGES: { key: ApplicantStageMock; label: string; tone: string }[] = [
  { key: "new", label: "New", tone: "bg-[rgba(108,92,231,0.1)] text-[#6C5CE7]" },
  {
    key: "reviewing",
    label: "Reviewing",
    tone: "bg-[rgba(240,165,0,0.12)] text-[#C28100]",
  },
  {
    key: "interview",
    label: "Interview",
    tone: "bg-[rgba(59,141,217,0.12)] text-[#3B8DD9]",
  },
  {
    key: "hired",
    label: "Hired",
    tone: "bg-[rgba(0,184,148,0.12)] text-[#00B894]",
  },
  {
    key: "rejected",
    label: "Rejected",
    tone: "bg-[#F0F1F5] text-[#64748B]",
  },
];

export function PipelinePanel() {
  const applicants = MOCK_APPLICANTS;

  return (
    <div className="space-y-5">
      <Phase2Banner
        title="Hiring pipeline"
        body="Drag applicants between stages to track progress. Auto-promotes to Staff when moved to Hired (assigns to this store with the Staff role)."
      />

      <div className="grid grid-cols-5 gap-3">
        {STAGES.map((stage) => {
          const cards = applicants.filter((a) => a.stage === stage.key);
          return (
            <div
              key={stage.key}
              className="flex min-h-[280px] flex-col rounded-2xl bg-[#F0F1F5] p-2.5"
            >
              <div className="flex items-center justify-between px-2 pb-2.5 pt-1">
                <span
                  className={[
                    "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold",
                    stage.tone,
                  ].join(" ")}
                >
                  {stage.label}
                </span>
                <span className="text-[10.5px] font-medium text-[#64748B]">
                  {cards.length}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-2">
                {cards.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-[#CBD5E1] px-3 py-6 text-center text-[11px] text-[#94A3B8]">
                    No one here
                  </div>
                ) : (
                  cards.map((a) => (
                    <div
                      key={a.id}
                      className="cursor-not-allowed rounded-lg bg-white p-2.5 ring-1 ring-[#E2E4EA] transition-shadow hover:shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(108,92,231,0.1)] text-[10px] font-semibold text-[#6C5CE7]">
                          {a.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[12px] font-medium text-[#1A1D27]">
                            {a.name}
                          </p>
                          <p className="truncate text-[10.5px] text-[#94A3B8]">
                            {a.experience}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[10.5px] text-[#64748B]">
                        <span>{a.appliedAt}</span>
                        {a.score !== undefined && (
                          <span className="rounded bg-[#F0F1F5] px-1.5 py-0.5 font-mono font-semibold tabular-nums text-[#1A1D27]">
                            {a.score}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
