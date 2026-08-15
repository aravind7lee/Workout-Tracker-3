PHASE 3 — REAL ANALYTICS & PROGRESS ENGINE

ROLE

Act as a Senior Data Engineer, Backend Architect, Fitness Analytics
Engineer, Full-Stack Engineer and Product Analyst.

Phase 2 is complete.

==================================================
PRIMARY OBJECTIVE
==================================================

Replace all fake/mock workout analytics with real calculations
based entirely on the user's MongoDB workout and nutrition data.

NO MOCK ANALYTICS.

==================================================
ANALYZE FIRST
==================================================

Inspect:

- analytics routes
- analytics controllers
- analytics services
- Workout schema
- Meal schema
- Exercise schema
- muscle metadata
- dashboard statistics
- existing charts
- Recharts
- Chart.js

Determine which analytics are genuinely supported by available data.

Do not invent metrics that the database cannot reliably support.

==================================================
REAL ANALYTICS
==================================================

Implement, where data supports them:

1. Workout count
2. Workout frequency
3. Workout duration
4. Total volume
5. Exercise progression
6. Weight progression
7. Rep progression
8. Muscle-group volume
9. Weekly/monthly trends
10. Personal records
11. Estimated 1RM
12. Consistency

==================================================
EXERCISE PROGRESS
==================================================

Allow users to select an exercise.

Display real historical performance.

Example:

Bench Press

Date      Weight
Aug 01    60kg
Aug 05    62.5kg
Aug 09    65kg

No fake values.

==================================================
1RM
==================================================

Implement estimated 1RM using a documented formula.

Clearly label it:

Estimated 1RM

NOT actual tested 1RM.

Do not overstate accuracy.

==================================================
MUSCLE VOLUME
==================================================

Use the existing exercise-to-muscle mapping.

Calculate volume/sets from actual workout data.

Do not make medical or physiological claims.

==================================================
FREQUENCY
==================================================

Calculate workout frequency from actual completed workout dates.

Avoid N+1 database queries.

Use efficient aggregation.

==================================================
CONSISTENCY
==================================================

Provide a transparent consistency calculation.

Example:

Target: 4 workouts/week
Completed: 3
Consistency: 75%

Do not fabricate a proprietary "fitness score"
without a clear definition.

==================================================
CHARTING
==================================================

Determine whether Recharts or another existing chart system
should be the canonical charting solution.

Avoid maintaining two libraries unnecessarily.

Charts must have:

- loading state
- empty state
- error state
- meaningful labels
- responsive behavior

==================================================
ANALYTICS API
==================================================

Ensure analytics endpoints:

- authenticate users
- query only their data
- return consistent response structures
- support reasonable date ranges
- avoid unnecessary database work

==================================================
DASHBOARD DATA
==================================================

Do not redesign the entire dashboard yet.

Only connect existing dashboard metrics to real data where appropriate.

==================================================
VALIDATION
==================================================

Create test data if necessary ONLY in a safe development/test environment.

Verify analytics manually against known workout records.

For example:

If a user has:

60kg × 10
60kg × 10

volume must mathematically match the defined calculation.

==================================================
NON-GOALS
==================================================

Do NOT implement:

- progressive overload
- plateau detection
- deload recommendations
- AI
- complete dashboard redesign

==================================================
FINAL REPORT
==================================================

Report:

- analytics implemented
- formulas used
- aggregation strategy
- APIs changed
- charts changed
- test calculations
- remaining analytics gaps

STOP after Phase 3.