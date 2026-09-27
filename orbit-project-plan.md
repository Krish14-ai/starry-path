# Orbit — Recovery Companion App: Full Project Plan

## 1. Overview

Orbit is a calm, gentle web/mobile-friendly app that helps people overcome addictive behaviors and build healthier habits. It combines daily tracking, gamified growth, a personalized AI coach, community support, and an emergency rescue flow — all wrapped in a supportive, non-judgmental experience.

**Core principles:**
- Small wins matter — every check-in, focused minute, and honest moment counts.
- Relapse is not failure — the app never shames the user.
- You are not alone — anonymous community support is one tap away.

**Note on design:** This plan defines the structure and functionality of every feature. The visual design (colors, layout, component styling) will be finalized based on a reference photo/design provided separately. The backend and database structure below do not depend on the final visual design and can be built in parallel.

---

## 2. Complete Function List

| # | Function | Purpose |
|---|----------|---------|
| 1 | Authentication | Signup, login, secure sessions |
| 2 | Onboarding | First-time welcome, addiction-type selection |
| 3 | Daily Check-in | Log mood, urge level, triggers, wins |
| 4 | Streaks & Orbs | Track consistency, soft XP rewards |
| 5 | Focus Mode | Productivity timer with distraction/reset logging |
| 6 | Growth System | XP, levels, 6 identity stages, 5 milestones |
| 7 | Community Support | Anonymous posts, likes, replies, reporting |
| 8 | Learn | Bite-sized lessons with progress tracking |
| 9 | AI Coach | Intake questions → personalized plan → locked course |
| 10 | Panic Button | Instant grounding tools + one-tap emergency call |
| 11 | Notifications | Reminders, streak alerts, milestone celebrations |
| 12 | Settings | Emergency contact, preferences, account management |
| 13 | Growth Tree | A visual tree that grows with consistency and wilts (not dies) when a streak breaks |

---

## 3. Architecture

**Client app (frontend)**
- React + TypeScript, Vite, Tailwind CSS
- Mobile-first, installable as a PWA (Progressive Web App)
- Offline-first for personal data (IndexedDB), so progress is never lost without internet
- Visual design applied on top of this structure once the reference photo/design is provided

**API server (backend)**
- Node.js + Express, TypeScript
- Zod for input validation on every endpoint
- Organized into services: Auth, Check-in, Streaks, Focus, Growth, Community, Learn, AI Coach, Notifications, Panic
- All external calls (AI, push notifications) happen server-side only — API keys never exposed to the client

**Database**
- PostgreSQL with Drizzle ORM

**AI Coach service**
- Calls Claude API (Anthropic) from the backend only

**Notifications service**
- Push + email, triggered by streaks, growth milestones, and check-in reminders

---

## 4. Database Schema (key tables)

- `users` — id, email, password_hash, addiction_type, emergency_contact_number, created_at
- `checkins` — id, user_id, date, mood, urge_level, triggers, wins
- `streaks` — id, user_id, current_streak, longest_streak, free_since_date
- `xp_events` — id, user_id, source (focus/checkin), amount, created_at
- `growth_stages` — id, user_id, current_level, current_stage, milestones_unlocked
- `focus_sessions` — id, user_id, duration, distractions_logged, resets_logged
- `community_posts` — id, user_id (anonymous handle), content, tag, created_at
- `community_reports` — id, post_id, reason, status
- `lessons` — id, title, content, category
- `lesson_progress` — id, user_id, lesson_id, completed_at
- `ai_coach_intake_responses` — id, user_id, question, answer
- `ai_coach_plans` — id, user_id, plan_content, status (`pending`/`active`/`completed`/`abandoned`), created_at, completed_at
- `ai_coach_messages` — id, user_id, role, message, created_at
- `notifications` — id, user_id, type, sent_at
- `tree_state` — id, user_id, growth_points, health_percentage, stage (`seed`/`sprout`/`sapling`/`tree`/`flourishing`), last_updated

---

## 5. Backend Reliability Requirements

To avoid backend issues:
- Every endpoint validates input with Zod before processing
- Centralized error-handling middleware — no unhandled exceptions reach the client
- Rate limiting on auth endpoints (prevent brute-force)
- Automated tests (unit + integration) for every service before moving to the next phase
- Sensitive fields (mood/trigger logs, emergency contact) encrypted at rest
- Structured logging for debugging without exposing sensitive data

---

## 6. AI Coach — Detailed Flow

1. **Intake** — Coach asks the user a short set of questions (addiction type, duration, common triggers, daily routine, goal) before creating anything. Stored in `ai_coach_intake_responses`.
2. **Plan generation** — Using the intake answers, the coach generates a personalized multi-day plan (goals, linked lessons, check-in targets).
3. **Confirmation** — User is asked: "Do you want to follow this plan?" Only on acceptance does the plan become `active`.
4. **Lock** — While `active`, the plan cannot be deleted. Only an explicit "abandon course" action (separate from delete, with a warning) can exit early.
5. **Completion** — Once all linked steps are done, status becomes `completed` and the plan can then be deleted or archived.

**Model choice:** Claude Haiku 4.5 for everyday chat messages (fast, low-cost); Claude Sonnet 5 for intake/plan generation and any crisis-related conversation (needs stronger judgment).

---

## 7. Panic Button — Detailed Flow

- User can optionally set a trusted emergency contact number in Settings; a national helpline number is set as the default fallback.
- Tapping Panic instantly opens the breathing/grounding screen.
- At the same time, a `tel:` link is triggered to open the phone's dialer pre-filled with the contact/helpline number.
- The user taps the device's own "Call" button to connect (this one tap is enforced by the phone's operating system for privacy/security reasons and cannot be bypassed in a web app).
- After the call, the user returns to the grounding exercise if needed.

**Future option:** A native Android app (not a web app) could request `CALL_PHONE` permission to place the call with zero taps. This is not possible on iOS under any circumstances, and not possible in any web app on either platform.

---

## 8. Growth Tree — Detailed Flow

A tree is shown on the dashboard as a visual summary of the user's whole journey — separate from (but fed by) the XP/streak numbers, so progress *feels* real, not just a number going up.

- **Growth:** Every completed check-in, focus session, and lesson adds `growth_points`. As points cross thresholds, the tree visually advances through stages: seed → sprout → sapling → tree → flourishing tree.
- **Streak break:** Instead of resetting the tree to a seed, `health_percentage` drops — leaves thin out and color dims. The tree does **not** die or reset to zero. This matches the app's core principle that relapse is not failure: the user sees a visible, honest consequence, but their overall growth (stage, growth_points) is preserved.
- **Recovery:** As the user resumes check-ins/sessions, `health_percentage` climbs back up over the next few days and the tree regains its leaves/color.

This keeps the tree meaningful (breaking a streak visibly matters) without making a bad day feel like starting over from nothing, which was the earlier concern with a hard streak reset.

---

## 9. Hosting & Deployment

- Domain/DNS setup is handled by the user directly.
- Suggested hosting: frontend on a static host (e.g. Vercel/Netlify), backend on a Node-friendly host (e.g. Render/Railway), database on a managed Postgres provider (e.g. Neon/Supabase).

---

## 10. Build Order (Phases)

1. Database schema + Auth
2. Onboarding + Check-in
3. Streaks + Growth System (XP/levels)
4. Growth Tree (points, stages, wilt/recovery logic)
5. Focus Mode
6. AI Coach (intake → plan → lock → completion)
7. Panic Button
8. Community + moderation
9. Learn module
10. Notifications
11. Security hardening + testing pass
12. Apply final visual design (from reference photo)

