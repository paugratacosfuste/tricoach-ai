# TriCoach AI — Project Status

> Last updated: 2026-02-17

---

## 1. What Is TriCoach AI

An AI-powered triathlon and running coaching application that generates personalized weekly training plans using the Claude API. The app takes an athlete through onboarding, creates a tailored first week, and then adapts subsequent weeks based on end-of-week feedback — forming a continuous coaching loop.

---

## 2. Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Framework** | Vite + React 18 | SPA, no SSR |
| **Language** | TypeScript | Strict types across the codebase |
| **UI Components** | shadcn/ui (49 components) | Built on Radix UI primitives |
| **Styling** | Tailwind CSS 3.x | Custom theme tokens (sport colors, gradients) |
| **Routing** | React Router DOM v6 | 8 routes defined in `App.tsx` |
| **State Management** | React Context API | 2 contexts: `TrainingContext`, `OnboardingContext` |
| **Data Persistence** | localStorage | No backend or database — **data loss on browser clear** |
| **AI Integration** | Claude API (Sonnet 4) | Direct browser-to-API calls via `fetch` |
| **Charts** | Recharts | Used in Progress page |
| **Animation** | Framer Motion | Installed but minimally used |
| **Forms** | React Hook Form + Zod | Available, used in onboarding |
| **Package Manager** | npm (also bun.lockb present) | |
| **Testing** | Vitest + Testing Library | Setup exists but only 1 placeholder test |
| **Scaffolding** | Lovable | Original template, since heavily modified |

---

## 3. Architecture

### 3.1 Application Flow

```
[Welcome Screen] → [Onboarding Wizard (5 steps)] → [Claude API generates Week 1]
                                                            ↓
[Dashboard] ← shows current week → [Calendar Page] (alternative view)
    ↓
[Complete Workouts] → mark complete / skip with basic data
    ↓
[End-of-Week Review] → feeling + physical issues + constraints
    ↓
[Claude API generates next week] → back to Dashboard
```

### 3.2 File Structure

```
src/
├── App.tsx                              # Root: QueryClientProvider → OnboardingProvider → TrainingProvider → Router
├── main.tsx                             # Entry point
│
├── pages/                               # 8 route pages
│   ├── Index.tsx                        # Gate: welcome → onboarding wizard → dashboard
│   ├── Dashboard.tsx                    # Main training view (464 lines)
│   ├── CalendarPage.tsx                 # Calendar with workout indicators (251 lines)
│   ├── ProgressPage.tsx                 # Charts & stats (259 lines) — partially functional
│   ├── GoalsPage.tsx                    # Race goal display (217 lines) — read-only
│   ├── SettingsPage.tsx                 # Settings toggles (227 lines) — mostly non-functional
│   ├── ProfilePage.tsx                  # Fitness metrics editor (201 lines) — doesn't propagate changes
│   └── NotFound.tsx                     # 404
│
├── contexts/
│   ├── TrainingContext.tsx              # Plan state: init, complete workout, generate next week (459 lines)
│   └── OnboardingContext.tsx            # Onboarding wizard state: 5 steps, partial data (179 lines)
│
├── components/
│   ├── dashboard/
│   │   ├── DashboardLayout.tsx          # Sidebar + MobileNav + content wrapper
│   │   ├── Sidebar.tsx                  # Desktop navigation sidebar
│   │   ├── MobileNav.tsx               # Bottom tab bar for mobile
│   │   ├── WeeklyStrip.tsx             # Horizontal day indicators
│   │   ├── WorkoutCard.tsx             # Workout summary card
│   │   └── WorkoutDetailSheet.tsx      # Slide-up workout detail with complete/skip buttons
│   ├── onboarding/
│   │   ├── OnboardingWizard.tsx        # Step router (5 steps)
│   │   └── steps/
│   │       ├── ProfileStep.tsx         # Name, age, gender, weight, height
│   │       ├── FitnessStep.tsx         # Level, LTHR, threshold pace, max HR, FTP, swim level
│   │       ├── GoalStep.tsx            # Race type, name, date, goal time, priority
│   │       ├── AvailabilityStep.tsx    # Per-day availability, time slots, max duration
│   │       └── IntegrationsStep.tsx    # Google Calendar + Strava (simulated) + plan generation trigger
│   ├── WeekReview.tsx                  # End-of-week feedback dialog (feeling, issues, constraints)
│   ├── NavLink.tsx                     # Navigation link component
│   └── ui/                            # 49 shadcn/ui components (Accordion, Button, Card, Dialog, etc.)
│
├── lib/
│   ├── claudeApi.ts                    # Claude API integration (494 lines) — THE core logic file
│   ├── mockPlanGenerator.ts            # UNUSED mock generator (287 lines) — outdated types
│   └── utils.ts                        # cn() utility
│
├── types/
│   └── training.ts                     # Full type system (253 lines)
│
├── hooks/
│   ├── use-mobile.tsx                  # Mobile detection hook
│   └── use-toast.ts                    # Toast notification hook
│
└── test/
    ├── setup.ts                        # Vitest setup (jsdom)
    └── example.test.ts                 # Placeholder test (trivial)
```

### 3.3 Data Model (from `types/training.ts`)

```
OnboardingData
├── UserProfile          { firstName, age, gender, weight, height }
├── FitnessAssessment    { fitnessLevel, lthr, thresholdPace, maxHR, ftp?, swimLevel }
├── RaceGoal             { raceType, raceName, raceDate, goalTime?, priority, customDistances? }
├── WeeklyAvailability   { monday..sunday: DayAvailability, weeklyHoursTarget }
└── Integrations         { googleCalendar: { connected, avoidConflicts }, strava: { connected, autoComplete } }

TrainingPlan
├── id, createdAt, raceName, raceDate, raceType, totalWeeks
├── currentWeekNumber
├── currentWeek: WeekPlan | null
│   ├── weekNumber, startDate, endDate, theme, focus, phase
│   ├── totalPlannedHours, isRecoveryWeek
│   └── workouts: Workout[]
│       ├── id, date, type, name, duration, distance?, description, purpose
│       ├── structure: WorkoutSegment[], heartRateGuidance, paceGuidance
│       ├── coachingTips[], adaptationNotes
│       ├── status: 'planned' | 'completed' | 'skipped' | 'partial'
│       └── actualData?: { duration, distance?, avgHR?, feeling: 1-5, notes? }
└── completedWeeks: CompletedWeek[]
    └── (same as WeekPlan + WeekSummary with feedback)
```

### 3.4 Claude API Integration (`claudeApi.ts`)

The app calls Claude's API **directly from the browser** using:
- Header: `anthropic-dangerous-direct-browser-access: true`
- Model: `claude-sonnet-4-20250514`
- Max tokens: 8,000

**Prompt structure** includes: athlete profile, HR zones (calculated from LTHR), race goal, training context (week number, phase, recovery week flags, fatigue warnings), compressed training history (last 2 weeks detailed, older weeks summarized), weekly availability per day, and triathlon-specific discipline distribution rules.

**Response parsing** includes a `fixTruncatedJson()` function that handles incomplete JSON responses by counting brackets and auto-closing them.

**History context** is built from `completedWeeks[]` — recent weeks get full detail, older weeks are compressed into averages.

### 3.5 Helper Functions in Type System

- `calculateHRZones(lthr)` — 5-zone model based on LTHR percentage
- `calculateTrainingPhase(currentWeek, totalWeeks)` — Maps to: Base → Build 1 → Build 2 → Peak → Taper → Race Week
- `isRecoveryWeek(weekNumber)` — Every 4th week is recovery/deload

---

## 4. What's Working (✅), Partial (⚠️), and Not Built (❌)

### ✅ Fully Functional
- **Onboarding wizard** — 5-step flow with localStorage persistence
- **Claude API plan generation** — Triathlon-aware prompts, JSON parsing with error recovery
- **Dashboard** — Current week display, today's workout expanded, upcoming workouts, week progress bar
- **Workout actions** — Mark complete / skip from dashboard or detail sheet
- **Week review & next week generation** — Feedback dialog → Claude → new week with history context
- **Calendar page** — Day-by-day view with workout indicators and click-to-detail
- **Responsive layout** — Desktop sidebar + mobile bottom nav

### ⚠️ Partially Implemented
- **Progress page** — Charts render but only current week data is used; no meaningful multi-week trends
- **Goals page** — Displays race info, countdown, distances, and current phase; **read-only, no editing**
- **Profile page** — Edits fitness metrics but changes **do NOT propagate** to `TrainingContext.userData` — next week generation uses stale onboarding data
- **Settings page** — Toggle switches rendered but **don't persist** (except reset onboarding)
- **Integrations** — Google Calendar & Strava UI exists; clicking "Connect" just sets `connected: true` locally — **no real OAuth** (marked `TODO` in code)

### ❌ Not Built
- Backend / API layer — everything is client-side
- Database — localStorage only
- Authentication — no login, single-user
- Real Strava / Google Calendar / Garmin integration
- Detailed workout logging (HR data, splits, RPE beyond 1-5)
- Multi-week history browsing UI
- Workout rescheduling / plan modification
- Push notifications
- Export / sharing
- Tests (only 1 placeholder test exists)

---

## 5. Known Technical Issues

1. **🔴 API Key in Frontend** — `VITE_ANTHROPIC_API_KEY` is bundled into client JS. Anyone can extract it from the built app. `.env.local` is gitignored, but the built bundle is not safe.

2. **🔴 No Data Backup** — Clearing browser data = complete loss of all training history and onboarding data.

3. **🟡 `mockPlanGenerator.ts` is dead code** — Uses an outdated `TrainingPlan` shape (`weeks[]`, `phase`, `notes`) that doesn't match the current type system (`currentWeek`, `completedWeeks`). Never imported anywhere.

4. **🟡 Profile edits are silently ignored** — `ProfilePage` calls `updateFitness()` from `OnboardingContext`, but `TrainingContext` loads `userData` from its own `STORAGE_KEYS.USER_DATA` on mount and never re-reads it. The two are out of sync.

5. **🟡 No error boundaries** — A Claude API failure or JSON parse error can leave the app in a broken state requiring manual `localStorage.clear()`.

6. **🟡 Date timezone edge cases** — Week start calculations assume local timezone; users in different timezones may see workouts on wrong days.
