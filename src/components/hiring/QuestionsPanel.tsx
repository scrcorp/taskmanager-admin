"use client";

import { Phase2Banner } from "./Phase2Banner";
import {
  MOCK_QUESTIONS,
  type ScreeningQuestionType,
} from "./_phase2Mock";

const TYPE_LABELS: Record<ScreeningQuestionType, string> = {
  text: "Free text",
  choice: "Single choice",
  availability: "Day picker",
  experience: "Single choice",
};

export function QuestionsPanel() {
  const questions = MOCK_QUESTIONS;

  return (
    <div className="space-y-5">
      <Phase2Banner
        title="Custom screening questions"
        body="Configure per-store screening questions that applicants answer before their application is submitted. Adds a Questions step to the public signup flow when enabled."
      />

      <div className="rounded-2xl border border-[#E2E4EA] bg-white">
        <div className="flex items-center justify-between border-b border-[#E2E4EA] px-5 py-3.5">
          <div>
            <h3 className="text-[13.5px] font-semibold text-[#1A1D27]">
              Question set
            </h3>
            <p className="mt-0.5 text-[11.5px] text-[#64748B]">
              Drag to reorder. Up to 10 questions per store.
            </p>
          </div>
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-lg bg-[#F0F1F5] px-3 py-1.5 text-[12px] font-medium text-[#94A3B8]"
          >
            + Add question
          </button>
        </div>

        <ul className="divide-y divide-[#E2E4EA]">
          {questions.map((q, idx) => (
            <li key={q.id} className="flex items-start gap-3 px-5 py-4">
              <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-[#F0F1F5] text-[11px] font-semibold text-[#64748B]">
                {idx + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[13px] font-medium text-[#1A1D27]">
                    {q.question}
                  </p>
                  <div className="flex flex-shrink-0 items-center gap-1.5">
                    <span className="rounded-full bg-[#F0F1F5] px-2 py-0.5 text-[10px] font-medium text-[#64748B]">
                      {TYPE_LABELS[q.type]}
                    </span>
                    {q.required && (
                      <span className="rounded-full bg-[rgba(239,68,68,0.1)] px-2 py-0.5 text-[10px] font-medium text-[#EF4444]">
                        Required
                      </span>
                    )}
                  </div>
                </div>
                {q.options && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {q.options.map((opt) => (
                      <span
                        key={opt}
                        className="rounded-md bg-[#F5F6FA] px-2 py-0.5 text-[11px] text-[#64748B] ring-1 ring-[#E2E4EA]"
                      >
                        {opt}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-shrink-0 gap-1 text-[#94A3B8]">
                <button
                  type="button"
                  disabled
                  aria-label="Edit"
                  className="cursor-not-allowed rounded-md p-1"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  type="button"
                  disabled
                  aria-label="Drag to reorder"
                  className="cursor-not-allowed rounded-md p-1"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="4" y1="9" x2="20" y2="9" />
                    <line x1="4" y1="15" x2="20" y2="15" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className="border-t border-[#E2E4EA] bg-[#F5F6FA] px-5 py-3.5 text-[11.5px] text-[#64748B]">
          When enabled, applicants see these questions as a final step before
          their application is submitted to the manager.
        </div>
      </div>
    </div>
  );
}
