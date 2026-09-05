# 🏆 Top 1% Workout Tracker — Complete Feature Implementation Plan

> This plan transforms the current GrindX Workout Tracker into a production-ready, market-leading fitness application. Every feature is designed to integrate with the existing MERN stack, Tailwind dark-mode UI, Framer Motion animations, and MongoDB Atlas backend.

---

## Table of Contents

1. [Codebase Audit Summary](#1-codebase-audit-summary)
2. [Feature 1: Premium Onboarding Flow](#2-feature-1-premium-onboarding-flow)
3. [Feature 2: Smart Workout Split Recommendation Engine](#3-feature-2-smart-workout-split-recommendation-engine)
4. [Feature 3: Body Metrics Tracking & Progress Dashboard](#4-feature-3-body-metrics-tracking--progress-dashboard)
5. [Feature 4: TDEE / Calorie Calculator Integration](#5-feature-4-tdee--calorie-calculator-integration)
6. [Feature 5: AI-Powered Workout Suggestions](#6-feature-5-ai-powered-workout-suggestions)
7. [Feature 6: Progressive Overload Tracking](#7-feature-6-progressive-overload-tracking)
8. [Feature 7: Rest Timer 2.0 with Smart Suggestions](#8-feature-7-rest-timer-20-with-smart-suggestions)
9. [Feature 8: Workout History Timeline & PR Wall](#9-feature-8-workout-history-timeline--pr-wall)
10. [Feature 9: Achievement & Badge System](#10-feature-9-achievement--badge-system)
11. [Feature 10: Social Feed & Community Enhancements](#11-feature-10-social-feed--community-enhancements)
12. [Feature 11: Weekly/Monthly Progress Reports](#12-feature-11-weeklymonthly-progress-reports)
13. [Feature 12: Export & Share Workouts](#13-feature-12-export--share-workouts)
14. [Verification Plan](#14-verification-plan)
15. [Priority & Execution Order](#15-priority--execution-order)

---

## 1. Codebase Audit Summary

### What Already Exists (DO NOT rebuild)

| Area | Existing Implementation | Key Files |
|---|---|---|
| **Auth** | JWT login/register, AuthContext, AuthGuard | [`AuthContext.jsx`](file:///d:/Workout-Tracker-3/frontend/src/context/AuthContext.jsx), [`auth.js`](file:///d:/Workout-Tracker-3/backend/routes/auth.js) |
| **Workout Session** | Full session lifecycle (SETUP → ACTIVE → COMPLETED), set tracking, rest timer, exercise picker, session recovery from localStorage | [`WorkoutSession.jsx`](file:///d:/Workout-Tracker-3/frontend/src/pages/WorkoutSession.jsx) |
| **Plans Builder** | Drag-and-drop plan creation, exercise library, auto-save, real-time sync to MongoDB | [`PlansBuilder.jsx`](file:///d:/Workout-Tracker-3/frontend/src/pages/PlansBuilder.jsx), [`Plan.js`](file:///d:/Workout-Tracker-3/backend/models/Plan.js) |
| **Workout Splits** | Pre-built splits library (PPL, Upper/Lower, Bro, Full Body), custom split builder, favorites | [`WorkoutSplits.jsx`](file:///d:/Workout-Tracker-3/frontend/src/pages/WorkoutSplits.jsx), [`CustomSplitBuilder.jsx`](file:///d:/Workout-Tracker-3/frontend/src/pages/CustomSplitBuilder.jsx) |
| **Nutrition** | Nutritionix API integration, meal tracking, macro progress, food categories, nutrition analytics | [`Nutrition.jsx`](file:///d:/Workout-Tracker-3/frontend/src/pages/Nutrition.jsx), [`Food.js`](file:///d:/Workout-Tracker-3/backend/models/Food.js) |
| **Streak System** | Check-in streaks, streak history calendar, tier system, streak widget | [`StreakHistory.jsx`](file:///d:/Workout-Tracker-3/frontend/src/pages/StreakHistory.jsx), User model streak fields |
| **Dashboard** | Real-time stats, recent workouts, plan stats, workout completion tracking | [`Dashboard.jsx`](file:///d:/Workout-Tracker-3/frontend/src/pages/Dashboard.jsx) |
| **Analytics** | Workout stats, volume tracking, muscle group distribution, meal counts | [`analytics.js`](file:///d:/Workout-Tracker-3/backend/routes/analytics.js) |
| **Profile** | Profile photo (Cloudinary), edit name/email, gym-themed backgrounds | [`Profile.jsx`](file:///d:/Workout-Tracker-3/frontend/src/pages/Profile.jsx) |
| **Settings** | Fitness goals, notifications, privacy, preferences (units, theme, language), data settings | [`Settings.jsx`](file:///d:/Workout-Tracker-3/frontend/src/pages/Settings.jsx) |
| **Forum** | Community posts, categories, likes, localStorage persistence | [`Forum.jsx`](file:///d:/Workout-Tracker-3/frontend/src/pages/Forum.jsx) |
| **Exercise Library** | Comprehensive library with muscle groups, form tips, video links | [`exerciseLibrary.js`](file:///d:/Workout-Tracker-3/frontend/src/data/exerciseLibrary.js) |
| **PR Tracking** | PR notifications on workout completion | [`PRNotification.jsx`](file:///d:/Workout-Tracker-3/frontend/src/components/PRNotification.jsx) |
| **Real-time Sync** | SSE, real-time contexts, sync services, offline support | [`RealTimeContext.jsx`](file:///d:/Workout-Tracker-3/frontend/src/context/RealTimeContext.jsx), 15+ real-time service files |

### What's Missing (This Plan Fills These Gaps)

| Gap | Impact | Priority |
|---|---|---|
| No onboarding flow — new users land on Home with no guidance | Users churn immediately, don't know what to do | 🔴 Critical |
| No body metrics storage (height, weight, age, gender) on User model | Cannot calculate TDEE, BMI, or recommend splits | 🔴 Critical |
| NutritionGoal model has metrics but User model doesn't — data is split | Confusing, no single source of truth for user body data | 🔴 Critical |
| No automatic split recommendation based on training frequency | Users must manually browse 20+ splits to find one | 🟡 High |
| Achievement model exists but has no frontend UI or backend logic | Badge system is a skeleton — no triggers, no display | 🟡 High |
| No progressive overload tracking (weight/rep progression per exercise) | Users can't see if they're actually getting stronger | 🟡 High |
| No TDEE/macro auto-calculation from user metrics | Nutrition goals are manually entered, feels amateur | 🟡 High |
| No workout history timeline (visual, scrollable) | Users see a list, not a timeline — not premium | 🟠 Medium |
| No export/share (PDF, image card, social) | Users can't flex their workouts — kills virality | 🟠 Medium |
| Forum is localStorage-only — not real social | No backend persistence, no multi-user interaction | 🟠 Medium |
| No weekly/monthly email or in-app progress reports | Users don't get reminded of their progress | 🟠 Medium |

---

## 2. Feature 1: Premium Onboarding Flow

### Overview
A cinematic, multi-step questionnaire shown to every new user immediately after registration. Collects body metrics and training preferences, then recommends and auto-creates a personalized workout split.

### User Experience Flow

```
Register → Redirect to /onboarding → Step-by-step animated flow → Split recommendation reveal → Dashboard
```

**Step 1 — Welcome Screen**
- Personalized greeting: "Welcome, {name}! Let's build your perfect plan."
- Animated gym silhouette background
- Single "Let's Go" CTA button

**Step 2 — Basic Info**
- Gender selection (Male / Female / Prefer Not to Say) — large icon cards
- Age input — number picker with smooth scroll
- Framer Motion slide transition between fields

**Step 3 — Body Metrics**
- Height input (cm or ft/in based on unit preference)
- Current Weight input (kg or lbs)
- Target Weight input (optional)
- Unit toggle (Metric ↔ Imperial) inline

**Step 4 — Fitness Goal**
- Large animated cards with icons:
  - 🔥 Lose Weight → `deficit`
  - 💪 Build Muscle → `bulk`
  - ⚖️ Maintain → `maintenance`
  - 🏋️ Get Stronger → `strength`
  - 🔄 Body Recomposition → `recomposition`
- Single selection, selected card glows with border animation

**Step 5 — Training Commitment**
- "How many days per week can you train?"
- Interactive slider (1–7) OR large day-count cards
- Below the selection, show a dynamic preview: "We'll recommend a **4-Day Upper/Lower Split**"
- The preview text updates live as the user moves the slider

**Step 6 — Activity Level**
- Cards: Sedentary / Lightly Active / Moderately Active / Very Active / Extra Active
- Used for TDEE calculation in Feature 4

**Step 7 — "Analyzing Your Profile…" (Faux Loading)**
- 3-second animated screen with:
  - Pulsing brain/AI icon
  - Progress bar filling up
  - Text cycling: "Analyzing body composition…" → "Calculating optimal split…" → "Building your plan…"
- Creates anticipation and perceived intelligence

**Step 8 — The Reveal**
- Glassmorphism card with the recommended split name and summary
- Example: "**Push / Pull / Legs** — 6 days per week"
- Below: day-by-day breakdown preview (Mon: Push, Tue: Pull, etc.)
- Two CTAs: "Accept & Start" (primary) | "Browse Other Splits" (secondary, links to /splits)
- Confetti animation on accept

### Backend Changes

#### [MODIFY] [`User.js`](file:///d:/Workout-Tracker-3/backend/models/User.js)

Add the following fields to the user schema:

```javascript
// Body metrics — single source of truth
metrics: {
  age: { type: Number, default: null },
  gender: { type: String, enum: ['male', 'female', 'other'], default: null },
  height: { type: Number, default: null },         // in cm (always stored metric)
  currentWeight: { type: Number, default: null },   // in kg (always stored metric)
  targetWeight: { type: Number, default: null },    // in kg
  bodyFatPercentage: { type: Number, default: null },
  bmi: { type: Number, default: null }
},

// Onboarding state
onboardingCompleted: { type: Boolean, default: false },
onboardingCompletedAt: { type: Date, default: null },

// Training preferences (extends existing fitnessGoals)
// Add to existing fitnessGoals object:
fitnessGoals: {
  // ... keep existing fields (goal, activityLevel, targetWeight, weeklyGoal)
  trainingFrequency: { type: Number, default: 4, min: 1, max: 7 },
  recommendedSplit: { type: String, default: null },  // e.g., 'ppl', 'upper_lower', 'full_body'
  experienceLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' }
}
```

#### [NEW] [`backend/controllers/onboardingController.js`](file:///d:/Workout-Tracker-3/backend/controllers/onboardingController.js)

```javascript
// Core logic:
// 1. Receive: { metrics, fitnessGoals, trainingFrequency, activityLevel }
// 2. Update User document with all fields
// 3. Run split recommendation algorithm (see Feature 2)
// 4. Auto-create a Plan document with the recommended split's exercises
// 5. Calculate TDEE and set NutritionGoal defaults (see Feature 4)
// 6. Set onboardingCompleted = true
// 7. Return: { user, recommendedSplit, plan, nutritionGoals }
```

#### [MODIFY] [`backend/routes/users.js`](file:///d:/Workout-Tracker-3/backend/routes/users.js)

Add endpoint:
```
POST /api/users/onboarding  →  onboardingController.completeOnboarding
```

### Frontend Changes

#### [NEW] [`frontend/src/pages/Onboarding.jsx`](file:///d:/Workout-Tracker-3/frontend/src/pages/Onboarding.jsx)

- Multi-step form component using `framer-motion` `AnimatePresence` for step transitions
- Each step is a sub-component rendered inside a `motion.div` with `initial`, `animate`, `exit` props
- Progress bar at top showing current step / total steps
- "Back" and "Next" navigation with validation per step
- Final API call to `POST /api/users/onboarding`
- On success: redirect to `/dashboard`

#### [NEW] [`frontend/src/services/onboardingService.js`](file:///d:/Workout-Tracker-3/frontend/src/services/onboardingService.js)

- `submitOnboarding(data)` — POST to `/api/users/onboarding`
- `getSplitRecommendation(frequency)` — local-first preview logic

#### [MODIFY] [`frontend/src/pages/Register.jsx`](file:///d:/Workout-Tracker-3/frontend/src/pages/Register.jsx)

Change line 75: `navigate("/")` → `navigate("/onboarding")`

#### [MODIFY] [`frontend/src/App.jsx`](file:///d:/Workout-Tracker-3/frontend/src/App.jsx)

- Import `Onboarding` page
- Add route: `<Route path="/onboarding" element={<Onboarding />} />`

#### [MODIFY] [`frontend/src/context/AuthContext.jsx`](file:///d:/Workout-Tracker-3/frontend/src/context/AuthContext.jsx)

- Expose `user.onboardingCompleted` in the auth state
- Add optional redirect logic: if logged in but `onboardingCompleted === false`, redirect to `/onboarding`

---

## 3. Feature 2: Smart Workout Split Recommendation Engine

### Overview
An algorithm that maps training frequency → optimal split, factoring in experience level and goal.

### Split Mapping Logic

```
Days/Week → Split Name → Day Breakdown
──────────────────────────────────────────────
1 day   → Full Body (1x)           → [Full Body]
2 days  → Full Body (2x)           → [Full Body A, Full Body B]
3 days  → Full Body (3x)           → [Full Body A, Full Body B, Full Body C]
         OR Push/Pull/Legs (1x)    → [Push, Pull, Legs]  (intermediate+)
4 days  → Upper/Lower (2x)         → [Upper A, Lower A, Upper B, Lower B]
5 days  → Upper/Lower + Full       → [Upper, Lower, Upper, Lower, Full Body]
         OR Bro Split (5-day)      → [Chest, Back, Shoulders, Legs, Arms]
6 days  → Push/Pull/Legs (2x)      → [Push, Pull, Legs, Push, Pull, Legs]
7 days  → PPL (2x) + Active Recovery → [Push, Pull, Legs, Push, Pull, Legs, Active Recovery]
```

### Goal-Based Adjustments

| Goal | Rep Range Emphasis | Rest Period | Volume Modifier |
|---|---|---|---|
| Lose Weight | 12-15 reps, supersets | 30-60s | Higher volume, cardio finishers |
| Build Muscle | 8-12 reps, moderate | 60-90s | Standard hypertrophy volume |
| Get Stronger | 3-6 reps, heavy | 2-5 min | Lower volume, compound focus |
| Recomposition | 8-12 reps, mixed | 60-90s | Moderate volume, progressive |

### Backend Implementation

#### [NEW] [`backend/services/splitRecommendationEngine.js`](file:///d:/Workout-Tracker-3/backend/services/splitRecommendationEngine.js)

```javascript
// Input:  { trainingFrequency, goal, experienceLevel }
// Output: { splitName, splitType, days: [{ dayName, focusMuscles, exercises: [...] }] }
//
// Each exercise object includes:
//   { name, sets, reps, rest, category, muscle, notes }
//
// Exercises pulled from the existing exerciseLibrary data structure
// to maintain consistency with the frontend library
```

This service contains NO external API calls — it is a pure algorithmic engine using hardcoded workout templates enriched from the exercise library.

---

## 4. Feature 3: Body Metrics Tracking & Progress Dashboard

### Overview
Allow users to log weight, body fat %, and measurements over time. Display progress charts on the Dashboard and Profile pages.

### Backend Changes

#### [NEW] [`backend/models/BodyMetric.js`](file:///d:/Workout-Tracker-3/backend/models/BodyMetric.js)

```javascript
const BodyMetricSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  weight: { type: Number, required: true },          // kg
  bodyFatPercentage: { type: Number, default: null },
  measurements: {
    chest: Number,    // cm
    waist: Number,
    hips: Number,
    biceps: Number,
    thighs: Number,
    neck: Number
  },
  notes: { type: String, default: '' },
  source: { type: String, enum: ['manual', 'smart_scale', 'onboarding'], default: 'manual' }
}, { timestamps: true });

BodyMetricSchema.index({ user: 1, date: -1 });
```

#### [NEW] [`backend/routes/bodyMetrics.js`](file:///d:/Workout-Tracker-3/backend/routes/bodyMetrics.js)

```
POST   /api/body-metrics         → Log a new entry
GET    /api/body-metrics         → Get all entries (paginated, sorted by date desc)
GET    /api/body-metrics/latest  → Get most recent entry
GET    /api/body-metrics/chart   → Get data formatted for chart (last 30/90/365 days)
DELETE /api/body-metrics/:id     → Delete an entry
```

### Frontend Changes

#### [NEW] [`frontend/src/components/BodyMetricsLogger.jsx`](file:///d:/Workout-Tracker-3/frontend/src/components/BodyMetricsLogger.jsx)

- Modal or expandable card on Dashboard/Profile
- Quick weight entry with +/- buttons
- Optional body fat % and measurements accordion
- "Log Weight" button saves to API

#### [NEW] [`frontend/src/components/WeightProgressChart.jsx`](file:///d:/Workout-Tracker-3/frontend/src/components/WeightProgressChart.jsx)

- Line chart (using Recharts, already in dependencies) showing weight over time
- Toggle: 30 days / 90 days / 1 year / All time
- Overlay: target weight line (dashed)
- Glassmorphism card container

#### [MODIFY] [`frontend/src/pages/Dashboard.jsx`](file:///d:/Workout-Tracker-3/frontend/src/pages/Dashboard.jsx)

- Add `WeightProgressChart` component in the stats section
- Add quick "Log Today's Weight" card

#### [MODIFY] [`frontend/src/pages/Profile.jsx`](file:///d:/Workout-Tracker-3/frontend/src/pages/Profile.jsx)

- Add body metrics display section showing current weight, BMI, body fat %
- Add `BodyMetricsLogger` modal trigger

---

## 5. Feature 4: TDEE / Calorie Calculator Integration

### Overview
Auto-calculate Total Daily Energy Expenditure (TDEE) from user metrics and activity level. Auto-set nutrition macro targets. Recalculate when weight changes.

### Calculation Formula

```
BMR (Mifflin-St Jeor):
  Male:   10 × weight(kg) + 6.25 × height(cm) − 5 × age − 161 + 5
  Female: 10 × weight(kg) + 6.25 × height(cm) − 5 × age − 161

TDEE = BMR × Activity Multiplier:
  Sedentary:    1.2
  Light:        1.375
  Moderate:     1.55
  Very Active:  1.725
  Extra Active: 1.9

Goal Adjustment:
  Lose Weight:      TDEE − 500 cal (0.5 kg/week deficit)
  Maintain:         TDEE
  Lean Bulk:        TDEE + 300 cal
  Bulk:             TDEE + 500 cal
  Recomposition:    TDEE (high protein)

Macro Split:
  Protein: 2.0g × body weight (kg)  → calories = protein × 4
  Fat:     25% of total calories     → grams = fat_cal / 9
  Carbs:   remaining calories        → grams = carb_cal / 4
```

### Backend Changes

#### [NEW] [`backend/services/tdeeCalculator.js`](file:///d:/Workout-Tracker-3/backend/services/tdeeCalculator.js)

Pure function:
```javascript
export function calculateTDEE({ weight, height, age, gender, activityLevel }) → { bmr, tdee }
export function calculateMacros({ tdee, goal, weight }) → { calories, protein, carbs, fat }
```

#### [MODIFY] [`backend/controllers/onboardingController.js`](file:///d:/Workout-Tracker-3/backend/controllers/onboardingController.js)

- After saving user metrics, call `calculateTDEE()` and `calculateMacros()`
- Create or update `NutritionGoal` document with calculated values

#### [NEW] `POST /api/users/recalculate-tdee`

- Called when user updates weight or activity level
- Recalculates and updates NutritionGoal

### Frontend Changes

#### [NEW] [`frontend/src/components/TDEECalculatorCard.jsx`](file:///d:/Workout-Tracker-3/frontend/src/components/TDEECalculatorCard.jsx)

- Standalone card showing: BMR, TDEE, daily calorie target, macro split
- Animated calorie meter (circular progress)
- "Recalculate" button if metrics change
- Placed on Nutrition page and optionally Dashboard

---

## 6. Feature 5: AI-Powered Workout Suggestions

### Overview
"Today's Suggested Workout" — a daily workout recommendation based on the user's split schedule, workout history, and what muscle groups haven't been trained recently.

### Logic (No External AI API Needed)

```
1. Get user's recommended split schedule (from onboarding)
2. Check: what day of the week is it?  →  Map to split day
3. Check: what did the user train yesterday / recently?
4. If they skipped a day:  suggest the skipped day's workout
5. If on schedule:  suggest today's planned workout
6. If no split assigned:  suggest the least-recently-trained muscle group
```

### Backend Changes

#### [NEW] `GET /api/users/todays-workout`

Returns:
```json
{
  "suggestion": {
    "title": "Push Day — Chest & Shoulders",
    "exercises": [...],
    "reason": "It's Tuesday — your PPL schedule has Push today",
    "estimatedDuration": 55,
    "difficulty": "intermediate"
  },
  "alternatives": [...]
}
```

### Frontend Changes

#### [NEW] [`frontend/src/components/TodaysWorkoutCard.jsx`](file:///d:/Workout-Tracker-3/frontend/src/components/TodaysWorkoutCard.jsx)

- Premium card on Dashboard
- Shows today's suggested workout with muscle groups, exercise count, estimated time
- "Start This Workout" button → navigates to `/workout-session` with exercises pre-loaded
- "See Alternatives" → expands to show 2-3 other options
- Animated entrance with Framer Motion

---

## 7. Feature 6: Progressive Overload Tracking

### Overview
Track weight/rep progression per exercise over time. Show users their strength curve for every exercise.

### Backend Changes

#### [MODIFY] Leverage existing [`Workout.js`](file:///d:/Workout-Tracker-3/backend/models/Workout.js) model

No model changes needed — the data already exists in completed workouts (`exercises[].sets[].weight`, `exercises[].sets[].reps`).

#### [NEW] `GET /api/analytics/exercise-progression/:exerciseName`

Aggregation pipeline:
```javascript
// 1. Find all completed workouts for this user containing this exercise
// 2. For each workout, extract the best set (highest weight × reps)
// 3. Return sorted by date: [{ date, bestWeight, bestReps, totalVolume, estimated1RM }]
```

Estimated 1RM Formula (Epley): `1RM = weight × (1 + reps/30)`

### Frontend Changes

#### [NEW] [`frontend/src/components/ExerciseProgressionChart.jsx`](file:///d:/Workout-Tracker-3/frontend/src/components/ExerciseProgressionChart.jsx)

- Line chart showing weight progression over time for a specific exercise
- Toggle between: Weight, Volume, Estimated 1RM
- Accessible from: Exercise Library detail, Workout History detail, Analytics page
- Highlight PRs with star markers on the chart

#### [MODIFY] [`frontend/src/pages/WorkoutDetails.jsx`](file:///d:/Workout-Tracker-3/frontend/src/pages/WorkoutDetails.jsx)

- For each exercise in the completed workout, show a mini progression sparkline
- "View Full History" link → opens `ExerciseProgressionChart` in a modal

---

## 8. Feature 7: Rest Timer 2.0 with Smart Suggestions

### Overview
Enhance the existing rest timer with smart rest period suggestions based on the exercise type and set intensity.

### Logic

```
Compound Heavy (Squat, Deadlift, Bench — ≤5 reps):  Suggest 3:00 min
Compound Moderate (6-10 reps):                        Suggest 2:00 min
Isolation (Curls, Laterals — 10-15 reps):             Suggest 1:00 min
Light / Burnout (15+ reps):                           Suggest 0:45 sec
```

### Frontend Changes

#### [MODIFY] [`frontend/src/pages/WorkoutSession.jsx`](file:///d:/Workout-Tracker-3/frontend/src/pages/WorkoutSession.jsx)

- After a set is completed, auto-suggest rest time based on exercise category and reps performed
- Show suggestion as a pill: "Suggested: 2:00" with option to tap to start
- User can still manually set any rest time
- Add subtle sound/vibration when rest timer ends (using Web Audio API or Notification API)

#### [MODIFY] [`frontend/src/components/RestTimerFloatingBar.jsx`](file:///d:/Workout-Tracker-3/frontend/src/components/RestTimerFloatingBar.jsx)

- Add circular progress ring animation
- Add "Skip Rest" button
- Add "+30s" quick-add button

---

## 9. Feature 8: Workout History Timeline & PR Wall

### Overview
A visually stunning, scrollable timeline view of all completed workouts. Plus a dedicated "PR Wall" showing all personal records.

### Frontend Changes

#### [NEW] [`frontend/src/components/WorkoutTimeline.jsx`](file:///d:/Workout-Tracker-3/frontend/src/components/WorkoutTimeline.jsx)

- Vertical timeline with cards for each workout
- Each card shows: date, workout title, duration, volume, muscle groups trained (colored dots)
- Cards alternate left/right on desktop, stack on mobile
- Lazy-loaded with infinite scroll
- Framer Motion stagger animation on scroll

#### [NEW] [`frontend/src/components/PRWall.jsx`](file:///d:/Workout-Tracker-3/frontend/src/components/PRWall.jsx)

- Grid of PR cards, one per exercise where a PR exists
- Each card: exercise name, PR weight, PR date, trend arrow (up/down vs previous PR)
- Filter by muscle group
- Animated "NEW PR!" badge on recently broken records

#### [MODIFY] [`frontend/src/pages/Dashboard.jsx`](file:///d:/Workout-Tracker-3/frontend/src/pages/Dashboard.jsx)

- Add "Recent PRs" section showing last 3-5 PRs

---

## 10. Feature 9: Achievement & Badge System

### Overview
The [`Achievement.js`](file:///d:/Workout-Tracker-3/backend/models/Achievement.js) model already exists but has zero implementation. Build the full system.

### Achievement Definitions

```
🏋️ First Blood         → Complete your first workout
🔥 Consistency King     → 7-day streak
⚡ Two Weeks Strong     → 14-day streak
💪 Iron Will            → 30-day streak
🏆 Century Club         → 100 completed workouts
📊 Data Nerd            → Log meals for 7 consecutive days
🎯 Goal Setter          → Complete onboarding
🚀 PR Hunter            → Break 5 personal records
⚖️ Weight Tracker       → Log weight 10 times
🍎 Nutrition Master     → Hit macro targets 7 days in a row
🏅 Split Master         → Complete all days of a workout split
👑 Elite                → 365-day streak
```

### Backend Changes

#### [NEW] [`backend/services/achievementEngine.js`](file:///d:/Workout-Tracker-3/backend/services/achievementEngine.js)

- Called after: workout completion, streak check-in, meal logging, weight logging, onboarding completion
- Checks all achievement conditions against user data
- Creates Achievement documents for newly unlocked achievements
- Returns list of newly unlocked achievements for frontend toast notifications

#### [MODIFY] [`backend/routes/workouts.js`](file:///d:/Workout-Tracker-3/backend/routes/workouts.js)

- After saving a completed workout, call `achievementEngine.check(userId)`

#### [NEW] `GET /api/achievements` → Return all achievements for user (locked + unlocked)

### Frontend Changes

#### [NEW] [`frontend/src/components/AchievementToast.jsx`](file:///d:/Workout-Tracker-3/frontend/src/components/AchievementToast.jsx)

- Animated toast notification when an achievement is unlocked
- Shows badge icon, title, description
- Confetti particles behind the badge
- Auto-dismiss after 5 seconds

#### [NEW] [`frontend/src/pages/Achievements.jsx`](file:///d:/Workout-Tracker-3/frontend/src/pages/Achievements.jsx)

- Full page showing all possible achievements
- Unlocked: full color with date achieved
- Locked: grayscale with progress bar (e.g., "3/7 day streak")
- Categories: Workout, Nutrition, Consistency, Social

#### [MODIFY] [`frontend/src/pages/Profile.jsx`](file:///d:/Workout-Tracker-3/frontend/src/pages/Profile.jsx)

- Add "Badges" section showing top 5 most recent achievements

---

## 11. Feature 10: Social Feed & Community Enhancements

### Overview
Upgrade the Forum from localStorage-only to a real MongoDB-backed social feed.

### Backend Changes

#### [MODIFY] [`backend/models/Post.js`](file:///d:/Workout-Tracker-3/backend/models/Post.js)

Expand the existing Post model:
```javascript
{
  user: { type: ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 1000 },
  category: { type: String, enum: ['General', 'PRs', 'Tips', 'Motivation', 'Nutrition', 'Progress'], default: 'General' },
  likes: [{ type: ObjectId, ref: 'User' }],
  comments: [{
    user: { type: ObjectId, ref: 'User' },
    content: String,
    createdAt: { type: Date, default: Date.now }
  }],
  attachedWorkout: { type: ObjectId, ref: 'Workout' },  // Share a workout
  attachedPR: { exerciseName: String, weight: Number, reps: Number },
  isPublic: { type: Boolean, default: true }
}
```

#### [MODIFY] [`backend/routes/posts.js`](file:///d:/Workout-Tracker-3/backend/routes/posts.js)

Expand from basic to full CRUD:
```
GET    /api/posts              → Feed (paginated, newest first)
POST   /api/posts              → Create post
POST   /api/posts/:id/like     → Toggle like
POST   /api/posts/:id/comment  → Add comment
DELETE /api/posts/:id          → Delete own post
```

### Frontend Changes

#### [MODIFY] [`frontend/src/pages/Forum.jsx`](file:///d:/Workout-Tracker-3/frontend/src/pages/Forum.jsx)

- Replace localStorage logic with real API calls
- Add "Share Workout" button that attaches a completed workout to a post
- Add "Share PR" auto-post when user breaks a record (opt-in)
- Real-time like counts and comment threads

---

## 12. Feature 11: Weekly/Monthly Progress Reports

### Overview
In-app progress summaries showing the user how they performed over the past week/month.

### Backend Changes

#### [NEW] `GET /api/analytics/weekly-report`

Returns:
```json
{
  "period": "Aug 26 - Sep 1, 2026",
  "workoutsCompleted": 5,
  "totalVolume": 45000,
  "totalDuration": 285,
  "caloriesBurned": 1800,
  "mealsLogged": 21,
  "avgDailyCalories": 2150,
  "avgDailyProtein": 165,
  "weightChange": -0.5,
  "prsSet": 2,
  "streakDays": 7,
  "topExercises": ["Bench Press", "Squat", "Pull-ups"],
  "muscleGroupDistribution": { "Chest": 25, "Back": 20, "Legs": 30, ... },
  "comparedToLastWeek": { "workouts": "+1", "volume": "+12%", "protein": "+5%" }
}
```

### Frontend Changes

#### [NEW] [`frontend/src/components/WeeklyReportCard.jsx`](file:///d:/Workout-Tracker-3/frontend/src/components/WeeklyReportCard.jsx)

- Summary card on Dashboard (collapsible)
- Key metrics with comparison arrows (↑ green, ↓ red vs last week)
- Mini bar chart for workout distribution by day
- "View Full Report" → opens detailed modal/page

#### [NEW] [`frontend/src/pages/ProgressReport.jsx`](file:///d:/Workout-Tracker-3/frontend/src/pages/ProgressReport.jsx)

- Full-page detailed report with charts
- Toggle: Weekly / Monthly view
- Recharts visualizations for all metrics
- Shareable as image (canvas screenshot)

---

## 13. Feature 12: Export & Share Workouts

### Overview
Let users export their workout data and share individual workouts as visual cards.

### Frontend Changes

#### [NEW] [`frontend/src/components/WorkoutShareCard.jsx`](file:///d:/Workout-Tracker-3/frontend/src/components/WorkoutShareCard.jsx)

- Generates a beautiful card image (using `html2canvas`) of a completed workout
- Shows: workout title, date, exercises, volume, duration, PRs
- Dark theme with gradient background
- "Share" button → opens system share dialog or downloads image

#### [NEW] [`frontend/src/utils/exportWorkouts.js`](file:///d:/Workout-Tracker-3/frontend/src/utils/exportWorkouts.js)

- Export all workouts as CSV
- Export single workout as PDF
- Export progress report as PDF

---

## 14. Verification Plan

### For Each Feature

1. **Backend**: Test each new API endpoint with manual curl/Postman requests
2. **Frontend**: Verify UI renders correctly, animations are smooth, responsive on mobile
3. **Integration**: Complete end-to-end flow test

### Critical Flow Tests

| Test | Steps | Expected Result |
|---|---|---|
| Onboarding E2E | Register → Complete all steps → Accept split | User in DB has `onboardingCompleted: true`, Plan created, NutritionGoal set |
| Returning User | Login with existing user who completed onboarding | Goes to Dashboard, NOT /onboarding |
| New User Gate | Login with user who hasn't completed onboarding | Redirected to /onboarding |
| Weight Logging | Log weight → Check chart | New entry appears, chart updates |
| TDEE Calculation | Male, 80kg, 180cm, 25yo, moderate → Calculate | TDEE ≈ 2,665 cal |
| Achievement Trigger | Complete first workout | "First Blood" achievement toast appears |
| PR Detection | Lift heavier than previous best | PR notification + PR Wall updated |
| Split Recommendation | Select 6 days/week, Build Muscle, Intermediate | Recommends PPL |
| Weekly Report | After 7 days of data | Report shows accurate stats with comparison |

---

## 15. Priority & Execution Order

> [!IMPORTANT]
> **Recommended execution order** — each phase builds on the previous one. Each phase is independently deployable.

### Phase 1: Foundation (Do First)
1. ✅ **User.js schema update** — Add `metrics`, `onboardingCompleted`, `trainingFrequency`
2. ✅ **TDEE Calculator service** — Pure functions, no dependencies
3. ✅ **Split Recommendation Engine** — Pure functions, no dependencies
4. ✅ **Onboarding API endpoint** — Ties everything together
5. ✅ **Onboarding.jsx frontend page** — The main deliverable

### Phase 2: Core Tracking
6. **BodyMetric model + routes** — Weight/measurement logging
7. **Body metrics UI** — Logger modal + weight chart on Dashboard
8. **TDEE Calculator Card** — Show calculated macros on Nutrition page
9. **Exercise Progression API** — Aggregation pipeline for strength curves
10. **Progressive Overload Charts** — Per-exercise progression visualization

### Phase 3: Engagement & Gamification
11. **Achievement Engine** — Backend service + triggers
12. **Achievement frontend** — Toasts, page, profile badges
13. **Today's Workout suggestion** — Dashboard card
14. **Smart Rest Timer** — Auto-suggest rest periods
15. **PR Wall** — Dedicated PR showcase

### Phase 4: Social & Polish
16. **Forum upgrade** — MongoDB-backed posts, likes, comments
17. **Weekly/Monthly reports** — API + frontend cards
18. **Workout sharing** — Image card generation
19. **Export functionality** — CSV/PDF export
20. **Workout Timeline** — Visual history view

> [!WARNING]
> **Phase 1 is the critical path.** Everything else depends on the User schema update and onboarding flow. Do not skip or reorder Phase 1.

---

## User Review Required

> [!IMPORTANT]
> **Split Templates**: The plan uses hardcoded workout templates for each split type. Should we pull exercises from the existing [`exerciseLibrary.js`](file:///d:/Workout-Tracker-3/frontend/src/data/exerciseLibrary.js) data, or define separate curated templates for each split?

> [!IMPORTANT]
> **Onboarding Enforcement**: Should users who haven't completed onboarding be **forcibly redirected** to `/onboarding` on every page load? Or should it be a dismissible banner/prompt on the Dashboard?

> [!IMPORTANT]
> **Forum Backend**: The current Forum is entirely localStorage. Migrating to MongoDB means all existing forum posts will be lost for current users. Is that acceptable?

> [!IMPORTANT]
> **Execution Scope**: This plan has 4 phases with 20 items. Do you want me to implement **all phases**, or start with **Phase 1 only** and iterate?
