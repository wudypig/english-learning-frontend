# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

User-facing English learning SPA. React 19 + TypeScript + Vite, light/warm theme optimized for reading, deployed to Firebase Hosting. App name: **Write Nest**.

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

### Design Guidelines

#### Color Scheme

Defined as CSS variables in `index.css`. Always use these variables or the mapped Tailwind classes — never hardcode raw hex values except when referencing these same tokens.

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-page` | `#F7F4EF` | Page background — warm off-white |
| `--bg-surface` | `#FFFFFF` | Cards and elevated surfaces |
| `--bg-surface-alt` | `#F0ECE5` | Alternate surface (disabled inputs, privacy rows) |
| `--border` | `#E2DDD6` | All borders and dividers |
| `--text-primary` | `#1C1917` | Main body text |
| `--text-secondary` | `#78716C` | Supporting labels, descriptions |
| `--text-muted` | `#A8A29E` | Placeholders, timestamps, captions |
| `--accent` | `#1D4ED8` | Primary action — buttons, links, active nav, focus rings |
| `--accent-dark` | `#1E40AF` | Accent hover state |
| `--success` | `#047857` | Correct answers, good scores, save confirmations |
| `--warm` | `#B45309` | Secondary emphasis (amber) |
| `--danger` | `#B91C1C` | Errors, wrong answers |

In Tailwind JSX, use `stone-*` for grays (not `slate-*`) and explicit hex values like `text-[#1D4ED8]` when a CSS variable is not available as a utility.

#### Typography

Three font families loaded from Google Fonts. Each has a specific role — do not swap them.

| Font | Tailwind class | Role |
|------|----------------|------|
| `Playfair Display` | `font-display` | Logo / brand name only |
| `DM Sans` | `font-body` (default body) | All UI text — nav, buttons, labels, forms |
| `Lora` | `font-reading` | Article content, essay textarea, AI feedback body |

**Key rule:** Any text the user reads at length (article body, essay prompt, feedback) must use `font-reading` (Lora serif). The `.textarea-dark` class already applies Lora automatically.

Font size guidelines:
- Page headings: `text-2xl` to `text-3xl`, `font-semibold`
- Section headings: `text-base`, `font-semibold`
- Body / UI labels: `text-sm` (14px default via DM Sans)
- Reading content: `text-[1.05rem]` with `leading-[1.85]` (set in `.prose-reading` / `.textarea-dark`)

#### Component Classes (defined in `index.css`)

| Class | Description |
|-------|-------------|
| `.card-dark` | White card, warm border, subtle shadow — used for all content panels |
| `.card-dark-hover` | Same as card-dark + lift-on-hover transition |
| `.btn-gradient-purple` | Primary action button — blue (`--accent`) |
| `.btn-gradient-emerald` | Success/reading action button — green (`--success`) |
| `.btn-gradient-blue` | Secondary action button — ocean blue (`#0369A1`) |
| `.btn-gradient-orange` | Warm/amber action button |
| `.input-dark` | Light text input with warm border and blue focus ring |
| `.textarea-dark` | Essay textarea — Lora font, 1.85 line-height, resizable |
| `.gradient-text-*` | Solid accent-colored text (not actual gradients) |
| `.gradient-bg-*` | Solid accent-colored background for icon containers |
| `.glow-*` | Soft drop shadow for icon containers |
| `.animate-slide-up/fade-in/scale-in` | Entry animations (0.25–0.3s ease-out) |

#### UI Patterns

**Error states:** `bg-red-50 border border-red-200 text-red-700 rounded-lg p-3.5`

**Success states:** `bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg p-3.5`

**Explanation panels (Chinese):** `bg-amber-50 border border-amber-200 text-amber-800`

**Reading option buttons (Reading page):**
- Default: `border border-[#E2DDD6] bg-white text-stone-700 hover:bg-stone-50`
- Selected: `border-2 border-blue-500 bg-blue-50 text-blue-900`
- Correct: `border-2 border-emerald-400 bg-emerald-50 text-emerald-900`
- Wrong: `border-2 border-red-400 bg-red-50 text-red-900`

**Active nav link:** `bg-blue-700 text-white`

**Toggle switches (Settings):** `bg-blue-600` when on, `bg-stone-300` when off

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
