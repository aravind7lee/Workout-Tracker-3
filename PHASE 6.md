PHASE 6 — PRODUCTION HARDENING, PERFORMANCE & QUALITY

ROLE

Act as a Principal Software Architect, Senior DevOps Engineer,
Performance Engineer, Security Engineer, QA Lead and Production
Readiness Reviewer.

Phases 0–5 are complete.

==================================================
PRIMARY OBJECTIVE
==================================================

Prepare GrindX for production-quality deployment.

Do NOT introduce major new product features.

This phase is for reliability, maintainability, performance,
security and testing.

==================================================
ANALYZE FIRST
==================================================

Perform a complete production-readiness audit.

Inspect:

- frontend bundle
- images
- dependencies
- API calls
- database queries
- indexes
- pagination
- caching
- localStorage
- error handling
- logging
- authentication
- authorization
- CORS
- environment variables
- build configuration
- deployment configuration
- tests
- accessibility

==================================================
FRONTEND PERFORMANCE
==================================================

Investigate:

- large images
- duplicate libraries
- unused dependencies
- unnecessary rendering
- oversized components
- unnecessary CSS
- unnecessary animations
- bundle size

Optimize only where measurable or clearly justified.

==================================================
IMAGES
==================================================

Review large image assets.

Prefer:

- optimized formats
- appropriate dimensions
- lazy loading
- responsive loading where useful

Do not sacrifice visual quality unnecessarily.

==================================================
CHART LIBRARIES
==================================================

If both Chart.js and Recharts remain:

Determine whether one can be removed safely.

Do not remove a library without checking imports.

==================================================
BACKEND PERFORMANCE
==================================================

Review:

- N+1 queries
- unbounded queries
- missing indexes
- duplicate database calls
- inefficient aggregation
- unnecessary data transfer

Implement pagination where appropriate.

==================================================
API CONSISTENCY
==================================================

Normalize API response structures where practical.

Do not break existing consumers.

Use versioning/migration strategy if required.

==================================================
VALIDATION
==================================================

Ensure important APIs have robust validation.

Prevent:

- malformed data
- unauthorized access
- mass assignment
- invalid numeric values
- invalid object IDs

==================================================
TESTING
==================================================

Establish meaningful automated tests for critical flows.

At minimum:

Authentication
Workout creation
Workout completion
Workout history
Previous performance
Plans
Nutrition
Analytics
Fitness intelligence

Do not create meaningless tests simply to increase coverage.

==================================================
END-TO-END SMOKE TEST
==================================================

Verify the complete user journey:

Register
→ Login
→ Dashboard
→ Plan
→ Start Workout
→ Log multiple exercises
→ Complete
→ History
→ Progress
→ Fitness insight
→ Nutrition
→ Logout
→ Login again

==================================================
PRODUCTION SECURITY REVIEW
==================================================

Re-check:

- secrets
- JWT
- CORS
- Helmet
- authorization
- validation
- error leakage
- logging
- environment configuration

==================================================
DEPLOYMENT READINESS
==================================================

Inspect:

Frontend:
- build
- environment variables
- SPA routing

Backend:
- environment variables
- production startup
- database connection
- error handling

Database:
- indexes
- connection handling

==================================================
CODE CLEANUP
==================================================

Now, and ONLY now, identify safe dead code.

For every deletion:

- prove it is unused
- verify imports
- run build/tests
- document the deletion

Do not perform blind mass deletion.

==================================================
FINAL PRODUCTION GATE
==================================================

The application must pass:

- build
- lint if configured
- tests
- critical smoke tests
- authentication tests
- workout tests
- analytics tests
- security review
- performance review

==================================================
FINAL REPORT
==================================================

Provide a Production Readiness Report:

1. Security
2. Performance
3. Reliability
4. Testing
5. Architecture
6. Database
7. Frontend
8. Backend
9. Deployment
10. Remaining risks
11. Recommended future improvements

Give each category:

PASS
PASS WITH WARNINGS
FAIL

Do not claim production-ready if critical issues remain.

STOP after Phase 6.