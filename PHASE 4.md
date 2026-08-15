PHASE 4 — FITNESS INTELLIGENCE ENGINE

ROLE

Act as an Elite Fitness Product Engineer, Strength-Training Data
Analyst, Principal Software Architect and Senior Full-Stack Engineer.

Phase 3 is complete.

==================================================
PRIMARY OBJECTIVE
==================================================

Turn GrindX from a passive workout logger into a data-driven
fitness assistant using deterministic algorithms.

IMPORTANT:

AI IS NOT REQUIRED.

Do not introduce an external paid AI API.

Prefer:

- mathematical formulas
- rules
- historical comparisons
- statistical trends
- deterministic logic

==================================================
ANALYZE FIRST
==================================================

Inspect:

- workout history
- exercise history
- plan targets
- previous-performance system
- analytics engine
- exercise metadata
- set/repetition data

Define exactly what data is available before designing algorithms.

==================================================
1 — PROGRESSIVE OVERLOAD
==================================================

Create a rule-based recommendation engine.

Example:

User repeatedly completes target repetitions.

System:

"Consider increasing the load next session."

Do not hardcode one universal progression rule.

Account for:

- target reps
- completed sets
- recent performance
- exercise type
- available increment
- historical progression

Recommendations must be transparent.

Show WHY the recommendation was produced.

==================================================
2 — PLATEAU DETECTION
==================================================

Detect persistent lack of progression.

Example:

Bench Press has remained around the same working weight
for several recent sessions.

Show:

Potential plateau detected.

Do not claim certainty.

Do not prescribe medical treatment.

Do not automatically change the user's training plan.

==================================================
3 — PR DETECTION
==================================================

Detect:

- highest weight
- highest estimated 1RM
- best rep performance where meaningful

Show clear PR notifications.

Avoid duplicate PR events.

==================================================
4 — CONSISTENCY
==================================================

Calculate workout consistency from real history.

Show:

- target frequency
- actual frequency
- consistency percentage
- streak where meaningful

Avoid manipulative gamification.

==================================================
5 — MUSCLE BALANCE
==================================================

Compare training volume/sets across muscle groups.

Provide informational observations.

Example:

"Your recent training volume is concentrated more heavily on
chest and shoulders than legs."

Do not diagnose overtraining.

==================================================
6 — DELOAD SIGNAL
==================================================

If enough reliable data exists, create a conservative informational
signal based on trends.

Do NOT make medical claims.

Do not say:

"You are overtrained."

Prefer:

"Your recent training load has increased consistently for several
weeks. Consider reviewing recovery and training load."

If insufficient data exists, do not generate the signal.

==================================================
7 — WHAT SHOULD I DO TODAY?
==================================================

If the user has a plan:

show the appropriate planned workout.

If no plan exists:

do not invent a training program automatically.

==================================================
ARCHITECTURE
==================================================

Create a dedicated fitness intelligence/domain layer.

Do NOT place algorithms directly inside React components.

Recommended conceptual architecture:

Workout Data
↓
Domain Calculations
↓
Fitness Intelligence
↓
Recommendation Objects
↓
API
↓
UI

The UI should display recommendations, not calculate them.

==================================================
EXPLAINABILITY
==================================================

Every recommendation must have:

- recommendation
- reason
- supporting data
- confidence/strength where appropriate
- timestamp

Do not create black-box behavior.

==================================================
SAFETY
==================================================

The application is a fitness tracker, not a medical device.

Avoid:

- medical diagnosis
- injury diagnosis
- medical treatment
- guaranteed outcomes
- unsafe exercise prescriptions

==================================================
NON-GOALS
==================================================

Do NOT introduce:

- paid AI
- external AI APIs
- social network
- complex gamification
- wearable integrations
- medical features

==================================================
TESTING
==================================================

Test algorithms using deterministic datasets.

For each algorithm provide:

input
→ calculation
→ expected result
→ actual result

Test edge cases.

==================================================
FINAL REPORT
==================================================

Report:

- algorithms implemented
- business rules
- formulas
- domain architecture
- APIs
- UI integration
- tests
- edge cases
- known limitations

STOP after Phase 4.