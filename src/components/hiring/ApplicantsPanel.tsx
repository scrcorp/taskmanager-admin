"use client";

import { Phase2Banner } from "./Phase2Banner";
import {
  MOCK_APPLICANTS,
  type ApplicantStageMock,
} from "./_phase2Mock";

const STAGE_LABEL: Record<ApplicantStageMock, string> = {
  new: "New",
  reviewing: "Reviewing",
  interview: "Interview",
  hired: "Hired",
  rejected: "Rejected",
};

const STAGE_STYLE: Record<ApplicantStageMock, string> = {
  new: "bg-[rgba(108,92,231,0.1)] text-[#6C5CE7] ring-[rgba(108,92,231,0.2)]",
  reviewing: "bg-[rgba(240,165,0,0.12)] text-[#C28100] ring-[rgba(240,165,0,0.25)]",
  interview: "bg-[rgba(59,141,217,0.12)] text-[#3B8DD9] ring-[rgba(59,141,217,0.25)]",
  hired: "bg-[rgba(0,184,148,0.12)] text-[#00B894] ring-[rgba(0,184,148,0.25)]",
  rejected: "bg-[#F0F1F5] text-[#64748B] ring-[#E2E4EA]",
};

export function ApplicantsPanel() {
  const applicants = MOCK_APPLICANTS;

  return (
    <div className="space-y-5">
      <Phase2Banner
        title="Applicant inbox"
        body="Review applications, schedule interviews, and move candidates through your hiring pipeline. Each applicant submits via the same signup link — Phase 2 splits them into Staff vs Applicant based on store-level mode."
      />

      <div className="overflow-hidden rounded-2xl border border-[#E2E4EA] bg-white">
        <div className="flex items-center justify-between border-b border-[#E2E4EA] px-5 py-3.5">
          <div>
            <h3 className="text-[13.5px] font-semibold text-[#1A1D27]">
              {applicants.length} applicants
            </h3>
            <p className="mt-0.5 text-[11.5px] text-[#64748B]">
              Sample data shown — Phase 2 implementation pending.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              disabled
              className="cursor-not-allowed rounded-lg border border-[#E2E4EA] bg-[#F5F6FA] px-2.5 py-1.5 text-[11.5px] text-[#94A3B8]"
            >
              <option>All stages</option>
            </select>
            <select
              disabled
              className="cursor-not-allowed rounded-lg border border-[#E2E4EA] bg-[#F5F6FA] px-2.5 py-1.5 text-[11.5px] text-[#94A3B8]"
            >
              <option>Sort: Newest</option>
            </select>
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E2E4EA] bg-[#F5F6FA] text-[10.5px] font-semibold uppercase tracking-wider text-[#64748B]">
              <th className="px-5 py-2.5 text-left">Applicant</th>
              <th className="px-3 py-2.5 text-left">Applied</th>
              <th className="px-3 py-2.5 text-left">Experience</th>
              <th className="px-3 py-2.5 text-left">Stage</th>
              <th className="px-3 py-2.5 text-right">Score</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E4EA]">
            {applicants.map((a) => (
              <tr
                key={a.id}
                className="cursor-not-allowed transition-colors hover:bg-[#F5F6FA]"
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(108,92,231,0.1)] text-[11px] font-semibold text-[#6C5CE7]">
                      {a.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-[#1A1D27]">
                        {a.name}
                      </p>
                      <p className="truncate text-[11px] text-[#94A3B8]">
                        {a.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-[12px] text-[#64748B]">
                  {a.appliedAt}
                </td>
                <td className="px-3 py-3 text-[12px] text-[#64748B]">
                  {a.experience}
                </td>
                <td className="px-3 py-3">
                  <span
                    className={[
                      "inline-flex rounded-full px-2 py-0.5 text-[10.5px] font-semibold ring-1",
                      STAGE_STYLE[a.stage],
                    ].join(" ")}
                  >
                    {STAGE_LABEL[a.stage]}
                  </span>
                </td>
                <td className="px-3 py-3 text-right">
                  {a.score !== undefined ? (
                    <span className="font-mono text-[12.5px] font-semibold tabular-nums text-[#1A1D27]">
                      {a.score}
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#94A3B8]">—</span>
                  )}
                </td>
                <td className="px-3 py-3 text-right text-[#94A3B8]">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
