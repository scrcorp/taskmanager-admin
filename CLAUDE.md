# Employee Management Service — Admin (Next.js)

> **IMPORTANT**: Before implementing any feature, read the parent `../CLAUDE.md` and relevant task docs in `../docs/tasks/`.
> Task documents are the Source of Truth for UI features, API integration, and permissions.
> Do NOT change existing screen layouts, color palette, or navigation structure without explicit request.

## Project Overview

Admin management console for multi-brand employee management. Next.js App Router with TypeScript. Dark theme UI.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State**: Zustand (global) + React Query (server state)
- **HTTP**: Axios
- **Icons**: Lucide React
- **Font**: DM Sans + Pretendard

## Project Structure

```
admin/
├── CLAUDE.md              ← You are here
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── .env.local.example
├── public/
├── src/
│   ├── app/                 ← App Router pages
│   │   ├── layout.tsx        (root layout: font, providers)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── (dashboard)/      (authenticated layout group)
│   │   │   ├── layout.tsx    (sidebar + main content)
│   │   │   ├── page.tsx      (dashboard)
│   │   │   ├── brands/
│   │   │   │   ├── page.tsx  (brand list)
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx (brand detail: tabs)
│   │   │   ├── users/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── assignments/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── tasks/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── announcements/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   └── notifications/
│   │   │       └── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   ├── ui/              (reusable primitives)
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── ConfirmDialog.tsx
│   │   ├── brands/
│   │   │   ├── BrandTable.tsx
│   │   │   ├── BrandDetail.tsx
│   │   │   ├── ShiftTab.tsx
│   │   │   ├── PositionTab.tsx
│   │   │   └── ChecklistTab.tsx
│   │   ├── users/
│   │   │   ├── UserTable.tsx
│   │   │   └── UserDetail.tsx
│   │   ├── assignments/
│   │   │   ├── AssignmentView.tsx
│   │   │   ├── AssignmentDetail.tsx
│   │   │   └── AssignModal.tsx
│   │   ├── tasks/
│   │   │   ├── TaskList.tsx
│   │   │   └── TaskDetail.tsx
│   │   ├── announcements/
│   │   │   ├── AnnouncementTable.tsx
│   │   │   └── AnnouncementDetail.tsx
│   │   └── notifications/
│   │       └── NotificationList.tsx
│   ├── lib/
│   │   ├── api.ts            (Axios instance + interceptor)
│   │   ├── auth.ts           (token storage, refresh logic)
│   │   └── utils.ts          (formatDate, cn helper)
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useBrands.ts
│   │   ├── useUsers.ts
│   │   ├── useAssignments.ts
│   │   ├── useTasks.ts
│   │   ├── useAnnouncements.ts
│   │   └── useNotifications.ts
│   ├── stores/
│   │   └── authStore.ts      (Zustand: user, token, logout)
│   └── types/
│       ├── index.ts           (all type exports)
│       ├── auth.ts
│       ├── organization.ts
│       ├── user.ts
│       ├── brand.ts
│       ├── assignment.ts
│       ├── checklist.ts
│       ├── announcement.ts
│       ├── task.ts
│       └── notification.ts
└── middleware.ts             (auth redirect: /login ↔ /dashboard)
```

## Design System

### Color Palette (Dark Theme)

```typescript
const colors = {
  bg: "#0F1117",
  surface: "#1A1D27",
  surfaceHover: "#22252F",
  card: "#1E2130",
  border: "#2A2D3A",
  accent: "#6C5CE7",
  accentLight: "#7C6DF0",
  accentMuted: "rgba(108, 92, 231, 0.15)",
  success: "#00B894",
  successMuted: "rgba(0, 184, 148, 0.15)",
  warning: "#FDCB6E",
  warningMuted: "rgba(253, 203, 110, 0.15)",
  danger: "#FF6B6B",
  dangerMuted: "rgba(255, 107, 107, 0.15)",
  text: "#E8E8EF",
  textSecondary: "#8B8DA3",
  textMuted: "#5A5C6F",
};
```

### Navigation (Sidebar)

```
[● TaskManager]
[Admin Console]
─────────────
Dashboard
Brands
Staff
Assignments
Additional Tasks
Notices
Alerts (unread badge)
─────────────
[Avatar] Admin email [Logout]
```

- Sidebar: 240px fixed left
- Active item: accent background + bold
- Detail pages: highlight parent nav item

## Screens (20 total)

### Phase 1 (7 screens)
1. **Login** — Username/password, reject staff accounts
2. **Dashboard** — Stat cards (Total/Pending/InProgress/Completed/ExtraTasks), brand completion rates, recent notices
3. **Brands List** — Table with name, address, shift/position counts, status
4. **Brand Detail** — 3 tabs: Shifts, Positions, Checklists (NO staff tab)
5. **Staff List** — Filter by role/status, table with name/role/status
6. **Staff Detail** — Profile info, stats, recent assignments with progress
7. **Roles** — Admin-only CRUD for roles with level

### Phase 2 (5 screens)
8. **Checklist Templates** — Inside brand detail Checklists tab
9. **Checklist Template Detail** — Item list with drag-drop reorder
10. **Assignments** — Date navigator + brand/shift/position grouped cards
11. **Assignment Detail** — Checklist progress (read-only from admin)
12. **Assign Modal** — Brand → Shift/Position (cascade) → Staff checkboxes

### Phase 3 (8 screens)
13. **Notices List** — Table with title/target/author/date
14. **Notice Detail** — Full content + Edit/Delete buttons
15. **Notice Create** — Form
16. **Tasks List** — Cards with priority dot, status badge
17. **Task Detail** — Description + assignees + creator, 2-column layout
18. **Task Create Modal** — Form with assignee selection
19. **Alerts** — Accordion expand on click, detail + navigate button
20. **Alert Detail** — Inline in accordion (time, status, link)

## API Integration

### Base URL
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### Auth Flow
1. Login → POST `/admin/auth/login` → store tokens
2. Axios interceptor: attach `Authorization: Bearer {token}`
3. 401 response → try refresh → POST `/admin/auth/refresh`
4. Refresh fails → redirect to `/login`

### Data Fetching Pattern (React Query)
```typescript
// hooks/useBrands.ts
export function useBrands() {
  return useQuery({
    queryKey: ["brands"],
    queryFn: () => api.get("/admin/brands").then(r => r.data),
  });
}

export function useCreateBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BrandCreate) => api.post("/admin/brands", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["brands"] }),
  });
}
```

## Development Phases

### Phase 1 — Build in this order:
1. Project setup: Next.js + Tailwind + providers
2. Auth: login page, token storage, middleware redirect
3. Layout: sidebar, route structure
4. Dashboard page with stat cards
5. Brands list + detail (shifts/positions tabs)
6. Staff list + detail
7. Roles management

### Phase 2:
8. Checklist tab in brand detail
9. Checklist template detail with items
10. Assignments page with date navigator
11. Assignment detail
12. Assign work modal

### Phase 3:
13. Notices CRUD
14. Additional Tasks CRUD
15. Notifications with accordion

## Commands

```bash
# Install
npm install

# Dev
npm run dev        # localhost:3000

# Build
npm run build
npm start

# Lint
npm run lint
```

## Coding Conventions

- Use Server Components by default, `"use client"` only when needed
- Keep page.tsx thin: import components, pass params
- All API calls in `hooks/` using React Query
- Type everything: no `any`
- Tailwind for all styling, custom theme colors in config
- Components: PascalCase files, one component per file
- Use `cn()` helper for conditional classes (clsx + tailwind-merge)
