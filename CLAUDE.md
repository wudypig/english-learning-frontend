# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

User-facing English learning SPA. React 19 + TypeScript + Vite, dark-themed, deployed to Firebase Hosting. App name: **Write Nest**.

## Commands

```bash
npm run dev      # Dev server on port 5173
npm run build    # tsc + vite build → dist/
npm run lint     # ESLint check
```

## Architecture

### Route Structure

```
/login               → Login (public)
/register            → Register (public)
/                    → Dashboard (protected)
/essay               → Essay writing test (protected)
/reading             → Reading comprehension test (protected)
/review              → Test history (protected)
/settings            → Profile + privacy settings (protected)
/search              → User search results (protected)
/users/:userId       → Another user's public dashboard (protected)
```

`ProtectedRoute` in `App.tsx` checks `useAuth()` — redirects to `/login` if no user. All protected routes are wrapped in `<Layout>`.

### File Map

```
src/
├── App.tsx                    # Routes + ProtectedRoute wrapper
├── context/AuthContext.tsx    # Global auth state (localStorage-backed)
├── lib/api.ts                 # Axios instance with auto Bearer token
├── utils/analytics.ts         # Score aggregation, streak, chart grouping
├── components/
│   ├── Layout.tsx             # Sticky navbar, mobile menu, user dropdown
│   ├── SearchBar.tsx          # Debounced search (500ms), keyboard nav, dropdown
│   ├── StatCard.tsx           # Gradient stat card with optional trend
│   ├── PerformanceChart.tsx   # Recharts line chart (essay + reading over time)
│   └── UserAvatar.tsx         # Avatar with initial fallback
└── pages/
    ├── Dashboard.tsx          # Stats, usage limits, recent activity, practice cards
    ├── Essay.tsx              # Generate topic → write → submit → AI feedback
    ├── Reading.tsx            # Generate article+MCQ → answer → submit → score
    ├── Review.tsx             # Expandable history of past tests
    ├── Settings.tsx           # Profile edits + privacy toggles
    ├── SearchResults.tsx      # User search grid (from URL ?q=)
    ├── UserDashboard.tsx      # Public user dashboard (respects privacy)
    ├── Login.tsx              # POST /auth/login
    └── Register.tsx           # POST /auth/register
```

### Auth Pattern

Same as admin: `localStorage` keys `token` + `user`, `AuthContext` restores on mount, `api.ts` interceptor injects Bearer token. `VITE_API_URL` env var (defaults to `http://localhost:3010`).

### Analytics Utilities (`utils/analytics.ts`)

All functions operate on `TestRecord[]`:

- `calculateTotalTests(history)` — count
- `calculateAverageScore(history, testType?)` — mean; **reading scores are normalized from 0–100 to 0–10 scale** before averaging
- `calculateStreak(history)` — consecutive days with at least one test
- `groupByDate(history)` — daily essay/reading averages (for `PerformanceChart`)
- `filterByTimePeriod(data, period)` — filter `DailyData[]` by `'7d' | '14d' | '30d' | 'all'`

> **Note:** Essay scores come from the server as 1.0–10.0. Reading scores come as 0–100 (percentage correct). `analytics.ts` divides reading scores by 10 to normalize both to the same scale.

### Key Page Flows

**Essay** (`/essay`):
1. `POST /content/essay/generate` → receives topic string
2. User writes in textarea
3. `POST /submit/essay` → receives `{ score, feedback }`
4. Optional: `POST /content/explain` for Chinese explanation

**Reading** (`/reading`):
1. `POST /content/reading/generate` → receives `{ article, questions: [{question, options}] }`
2. User selects one option per question
3. Validates all questions answered before submit
4. `POST /submit/reading` → receives score
5. Shows correct/wrong answer highlighting

**UserDashboard** (`/users/:userId`):
- `GET /user/:userId/dashboard` returns 403 if dashboard is set to private → shows lock icon

### Styling System

Global custom classes defined in `index.css` (Tailwind-based):

| Class | Usage |
|-------|-------|
| `.card-dark` | Standard dark card (border + shadow) |
| `.btn-gradient-purple/blue/emerald/orange` | Gradient buttons with hover scale |
| `.input-dark` / `.textarea-dark` | Form inputs with focus ring |
| `.gradient-text-*` / `.gradient-bg-*` | Gradient text and backgrounds |
| `.glow-purple/blue/emerald/orange` | Box shadow glow effects |
| `.animate-slide-up/fade-in/scale-in` | Entry animations |

Color scheme: dark navy (`#0F172A`) background, slate grays, purple/pink as primary gradient. All pages use this dark theme.

### API Endpoints Used

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/auth/login` | Login |
| POST | `/auth/register` | Register |
| GET | `/user/profile` | Dashboard data (stats + limits + recent records) |
| PUT | `/user/settings` | Update nickname/avatar/difficultyLevel |
| GET | `/user/history` | Full test history |
| GET | `/user/search?q=` | Search users (max 20 results) |
| GET | `/user/:id/dashboard` | Public user stats |
| GET | `/user/:id/activities` | Public user activity list |
| GET | `/user/privacy-settings` | Current privacy config |
| PUT | `/user/privacy-settings` | Update visibility settings |
| POST | `/content/essay/generate` | AI-generate essay topic |
| POST | `/content/reading/generate` | AI-generate article + MCQ |
| POST | `/content/explain` | AI explain content in Chinese |
| POST | `/submit/essay` | Submit essay for grading |
| POST | `/submit/reading` | Submit reading answers |
