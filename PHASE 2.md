PHASE 2 — WORKOUT HISTORY, DATA INTEGRITY & SOURCE OF TRUTH

ROLE

Act as a Principal Backend Architect, Database Engineer,
Senior Full-Stack Engineer and Data Integrity Engineer.

Phase 1 is complete.

==================================================
PRIMARY OBJECTIVE
==================================================

Make workout history reliable, queryable, scalable and consistent.

MongoDB must become the authoritative source of completed workout data.

==================================================
ANALYZE FIRST
==================================================

Inspect:

- Workout schema
- all workout write operations
- all workout read operations
- localStorage workout data
- synchronization logic
- workout history
- PRService
- analytics consumers
- exercise history
- plan-to-workout relationship

Map every source of workout data.

Identify conflicting sources.

==================================================
SOURCE OF TRUTH
==================================================

Establish:

MongoDB = authoritative completed workout history

localStorage = temporary active-workout recovery only

Do not allow permanent historical workout data to diverge
between browser storage and MongoDB.

==================================================
WORKOUT HISTORY
==================================================

Implement reliable:

- chronological history
- workout details
- exercise details
- set details
- duration
- total volume
- completion status
- date filtering
- exercise filtering

Use pagination where appropriate.

Do not load an unlimited number of workouts.

==================================================
EXERCISE HISTORY
==================================================

Create efficient backend queries for:

- last performance
- recent performances
- best performance
- total sessions
- total volume

Use proper database indexes where justified.

Avoid N+1 database queries.

==================================================
PERSONAL RECORDS
==================================================

Review current localStorage PR implementation.

Move authoritative PR tracking to backend persistence.

PR detection must be based on real workout data.

Avoid duplicate PR records.

If a PR can be calculated from workout history efficiently,
prefer deriving it rather than storing redundant state.

If persistence is required, explain why.

==================================================
DATA INTEGRITY
==================================================

Validate:

- weight
- reps
- sets
- exercise references
- user ownership
- workout status
- timestamps

Prevent malformed workout records.

==================================================
API DESIGN
==================================================

Use consistent response structures.

Do not create multiple endpoints for the same business operation.

Keep:

routes
controllers
services
repositories/data access

appropriately separated.

==================================================
PERFORMANCE
==================================================

Inspect database queries.

Add indexes only where supported by actual query patterns.

Avoid:

- N+1 queries
- loading entire history
- unnecessary duplicate queries
- repeated calculations

==================================================
TESTING
==================================================

Test:

- workout creation
- workout completion
- history retrieval
- exercise history
- PR detection
- pagination
- unauthorized access
- malformed input
- duplicate requests

==================================================
NON-GOALS
==================================================

Do NOT implement:

- advanced analytics dashboard
- progressive overload
- plateau detection
- AI
- major UI redesign

==================================================
FINAL REPORT
==================================================

Report:

- data-source architecture
- schema changes
- indexes
- APIs
- performance improvements
- PR architecture
- tests
- remaining data risks

STOP after Phase 2.