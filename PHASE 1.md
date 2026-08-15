PHASE 1 — CORE MULTI-EXERCISE WORKOUT SESSION

ROLE

Act as a Principal Software Architect, Senior Full-Stack Engineer,
Senior UX Engineer and Fitness Product Engineer.

You are continuing work on the existing GrindX Workout Tracker.

PHASE 0 has already been completed.

==================================================
PRIMARY OBJECTIVE
==================================================

Replace the existing single-exercise workout experience with a
proper multi-exercise workout SESSION system.

This is the core product functionality.

==================================================
MANDATORY WORKFLOW
==================================================

ANALYZE
→ ARCHITECTURE PLAN
→ IMPLEMENT
→ TEST
→ REVIEW
→ FIX
→ FINAL VALIDATION
→ REPORT
→ STOP

Do not skip analysis.

==================================================
STEP 1 — ANALYZE EXISTING IMPLEMENTATION
==================================================

Inspect all:

- Workout models
- Workout routes
- Workout controllers
- Workout services
- Workout components
- StartWorkout
- workout history
- plans
- exercise library
- rest timer
- localStorage workout logic
- synchronization logic
- completion logic

Identify conflicting implementations.

Do not create another duplicate workout service.

==================================================
STEP 2 — DEFINE CANONICAL WORKOUT SESSION
==================================================

Establish one authoritative workout-session architecture.

The conceptual flow:

Dashboard
↓
Start Workout
↓
Choose Plan OR Freestyle
↓
Workout Session
↓
Multiple Exercises
↓
Multiple Sets
↓
Complete Workout
↓
Workout Summary
↓
Persist to MongoDB

==================================================
STEP 3 — WORKOUT SESSION CAPABILITIES
==================================================

Implement:

- start workout
- plan-based workout
- freestyle workout
- multiple exercises
- add exercise
- remove exercise
- reorder exercises
- multiple sets
- weight
- reps
- set completion
- exercise completion
- rest timer
- workout duration
- notes if already supported appropriately
- complete workout
- abandon workout

==================================================
STEP 4 — PREVIOUS PERFORMANCE
==================================================

While logging an exercise, show real previous performance.

Example:

Last Workout
60kg × 10
60kg × 10
60kg × 8

This must come from authenticated backend data.

Never use mock data.

Implement a clean backend query/service for exercise history.

Ensure users can access ONLY their own data.

==================================================
STEP 5 — AUTO-SAVE
==================================================

Active workouts must survive:

- browser refresh
- accidental tab close where possible
- temporary network failure

Use local persistence only for an IN-PROGRESS draft.

Do not allow localStorage to become the permanent source of truth.

Completed workouts must be persisted to MongoDB.

Prevent duplicate completion submissions.

==================================================
STEP 6 — REPEAT LAST WORKOUT
==================================================

Implement:

Repeat Last Workout

The previous workout structure should be reused.

Historical set completion state must NOT be copied as completed.

The new workout must start as a new session.

==================================================
STEP 7 — WORKOUT HISTORY
==================================================

Establish one authoritative workout history implementation.

Before deleting duplicates:

- trace references
- determine canonical page
- migrate required logic
- verify routes
- test

Do not blindly delete files.

==================================================
STEP 8 — UX
==================================================

The workout interface must be:

- mobile-first
- fast
- low-friction
- easy to operate between sets
- clear
- responsive
- accessible

Minimize unnecessary navigation.

A user should be able to complete a 5–8 exercise workout
without repeatedly leaving and reopening different pages.

==================================================
STEP 9 — FAILURE HANDLING
==================================================

Handle:

- API failure
- invalid weight
- invalid reps
- incomplete sets
- refresh
- duplicate submission
- abandoned workout
- network failure
- loading
- empty states
- error states

==================================================
NON-GOALS
==================================================

DO NOT implement:

- analytics
- progressive overload
- plateau detection
- 1RM dashboard
- muscle analytics
- AI
- major dashboard redesign

==================================================
ACCEPTANCE TEST
==================================================

Verify:

Plan
→ Start
→ Exercise 1
→ 3 sets
→ Exercise 2
→ 3 sets
→ Exercise 3
→ 3 sets
→ Complete

MongoDB must contain ONE completed workout containing
all exercises and sets.

Verify previous-performance display.

Verify repeat-last-workout.

Verify refresh recovery.

Verify duplicate submission protection.

==================================================
FINAL REPORT
==================================================

Provide:

- architecture changes
- files changed
- APIs added/changed
- database changes
- frontend changes
- tests
- bugs fixed
- remaining issues
- manual QA procedure

STOP after Phase 1.