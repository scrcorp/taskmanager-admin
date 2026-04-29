/**
 * Phase 2 mock data — 실제 백엔드/스키마가 결정되기 전 시각적 미리보기용.
 * 이 파일은 실기능 구현 시 server hooks로 교체된다.
 */

export type ScreeningQuestionType = "text" | "choice" | "availability" | "experience";

export interface ScreeningQuestionMock {
  id: string;
  type: ScreeningQuestionType;
  question: string;
  required: boolean;
  options?: string[];
}

export type ApplicantStageMock =
  | "new"
  | "reviewing"
  | "interview"
  | "hired"
  | "rejected";

export interface ApplicantMock {
  id: string;
  name: string;
  email: string;
  appliedAt: string;
  stage: ApplicantStageMock;
  score?: number;
  experience: string;
}

export const MOCK_QUESTIONS: ScreeningQuestionMock[] = [
  {
    id: "q1",
    type: "text",
    question: "Why do you want to work at this store?",
    required: true,
  },
  {
    id: "q2",
    type: "availability",
    question: "Which days of the week are you available to work?",
    required: true,
    options: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
  {
    id: "q3",
    type: "experience",
    question: "How much experience do you have in a similar role?",
    required: false,
    options: [
      "No previous experience",
      "Less than 1 year",
      "1–3 years",
      "More than 3 years",
    ],
  },
];

export const MOCK_APPLICANTS: ApplicantMock[] = [
  {
    id: "a1",
    name: "Sarah Kim",
    email: "sarah.kim@example.com",
    appliedAt: "2026-04-26",
    stage: "interview",
    score: 88,
    experience: "1–3 years",
  },
  {
    id: "a2",
    name: "Daniel Park",
    email: "d.park@example.com",
    appliedAt: "2026-04-25",
    stage: "reviewing",
    score: 76,
    experience: "Less than 1 year",
  },
  {
    id: "a3",
    name: "Min-ji Lee",
    email: "minji.lee@example.com",
    appliedAt: "2026-04-25",
    stage: "new",
    experience: "More than 3 years",
  },
  {
    id: "a4",
    name: "Joon Cho",
    email: "joon.cho@example.com",
    appliedAt: "2026-04-24",
    stage: "hired",
    score: 92,
    experience: "1–3 years",
  },
  {
    id: "a5",
    name: "Yuna Bae",
    email: "yuna.bae@example.com",
    appliedAt: "2026-04-23",
    stage: "rejected",
    score: 41,
    experience: "No previous experience",
  },
  {
    id: "a6",
    name: "Ethan Kwon",
    email: "ethan.kwon@example.com",
    appliedAt: "2026-04-22",
    stage: "new",
    experience: "Less than 1 year",
  },
];
