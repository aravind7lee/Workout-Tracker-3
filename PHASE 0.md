PHASE 0 — SECURITY, STABILIZATION & ARCHITECTURAL BASELINE

ROLE

Act as a Principal Software Architect, Senior Full-Stack Engineer,
Application Security Engineer, Backend Engineer, QA Engineer and
Production Reliability Engineer.

You are working on the existing Workout Tracker application:

Workout-Tracker-3 / GrindX

IMPORTANT:
This is an EXISTING production-style codebase.

Do not treat it as a greenfield project.

==================================================
PRIMARY OBJECTIVE
==================================================

Secure and stabilize the existing application without unnecessarily
changing its existing product behavior.

This phase establishes the foundation for all future phases.

Do NOT implement future product features yet.

==================================================
MANDATORY AGENTIC WORKFLOW
==================================================

Follow this exact workflow:

1. ANALYZE
2. MAP DEPENDENCIES
3. PLAN
4. IMPLEMENT
5. VALIDATE
6. TEST
7. REVIEW YOUR OWN CHANGES
8. REPORT
9. STOP

Do not skip the analysis stage.

==================================================
STEP 1 — REPOSITORY ANALYSIS
==================================================

Inspect the complete repository before modifying anything.

Analyze:

- frontend architecture
- backend architecture
- routes
- controllers
- services
- models
- middleware
- authentication
- authorization
- environment configuration
- database configuration
- workout model
- analytics dependencies
- package dependencies
- duplicate implementations
- error suppression systems
- localStorage usage
- API communication
- existing tests

Do not assume that similarly named files are duplicates.

Trace imports and usages before deciding anything is dead.

==================================================
STEP 2 — SECURITY AUDIT
==================================================

Identify and fix confirmed security issues including, where applicable:

- committed .env files
- exposed secrets
- hardcoded JWT fallback
- credentials appearing in logs
- permissive CORS
- missing Helmet
- unsafe error responses
- mass assignment
- missing authorization
- unsafe user-controlled input
- insecure configuration

IMPORTANT:

Never print discovered credentials, tokens, passwords or API keys
in your response.

Rotate exposed credentials if the environment/tooling permits it.
Otherwise clearly tell me which credentials must be rotated manually.

Create/update:

.env.example

with placeholders only.

Ensure .env is ignored by Git.

==================================================
STEP 3 — AUTHENTICATION REVIEW
==================================================

Inspect:

- registration
- login
- password hashing
- JWT generation
- JWT verification
- auth middleware
- protected routes
- user ownership checks

Remove insecure fallback secrets.

Do not introduce refresh-token architecture unless the existing
architecture genuinely requires it in this phase.

Do not overengineer authentication.

==================================================
STEP 4 — EXPRESS SECURITY
==================================================

Implement appropriate production security including:

- Helmet
- restrictive CORS
- safe error responses
- appropriate request limits
- secure configuration

Do not blindly copy a generic security configuration.

Use the actual frontend/backend deployment architecture.

==================================================
STEP 5 — WORKOUT DATA FOUNDATION
==================================================

Inspect the existing Workout schema and every place that consumes it.

Determine the correct lifecycle model.

The workout lifecycle should support:

- in-progress
- completed
- abandoned

Where genuinely required, support:

- startedAt
- completedAt
- totalVolume

Do not create redundant fields without justification.

Preserve backward compatibility where possible.

==================================================
STEP 6 — ERROR HANDLING
==================================================

Inspect all error suppression files and global fetch interception.

DO NOT simply delete them.

Determine what each mechanism does.

Replace dangerous error suppression with proper error handling.

The application must expose useful errors during development
and safe errors in production.

==================================================
STEP 7 — VALIDATION
==================================================

Review validation for critical endpoints:

- auth
- users
- workouts
- plans
- meals

Only introduce a validation library if it provides clear value.

Do not add unnecessary dependencies.

==================================================
STEP 8 — DEAD CODE
==================================================

Do NOT mass-delete duplicate files in this phase.

Instead:

- identify duplicates
- identify references
- identify canonical implementations
- document candidates for future cleanup

Only remove something if you can prove it is unused and safe.

==================================================
STEP 9 — BASELINE TESTING
==================================================

Before finishing, verify:

- frontend starts
- backend starts
- database connects
- registration works
- login works
- authentication works
- exercise library works
- plans work
- nutrition works
- existing workout functionality still works
- profile/settings work

Run the project's available lint/build/test commands.

If tests do not exist, perform appropriate smoke tests.

==================================================
NON-GOALS
==================================================

DO NOT implement:

- multi-exercise workout session
- real analytics
- progressive overload
- plateau detection
- PR board
- dashboard redesign
- AI
- new fitness features

==================================================
QUALITY REQUIREMENTS
==================================================

Follow:

- Clean Architecture principles
- separation of concerns
- minimal changes
- backward compatibility
- secure defaults
- no unnecessary dependencies
- no duplicated business logic
- no hardcoded data
- no fake implementations

==================================================
FINAL REPORT
==================================================

Report:

1. Security issues discovered
2. Security issues fixed
3. Files changed
4. Database/schema changes
5. Architecture changes
6. Existing functionality verified
7. Tests executed
8. Remaining security risks
9. Dead-code candidates identified
10. Recommended next phase

Do NOT start Phase 1.

STOP after completing this phase.