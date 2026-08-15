                    GRINDX
                      │
                      ▼
             PHASE 0 PROMPT
                      │
                      ▼
              ANTIGRAVITY
          Analyze → Implement
                      │
                      ▼
                TEST EVERYTHING
                      │
             ┌────────┴────────┐
             │                 │
           PASS              FAIL
             │                 │
             ▼                 ▼
        Git Commit          Fix Phase 0
             │
             ▼
             PHASE 1
             │
             ▼
            TEST
             │
             ▼
             PHASE 2
             │
             ▼
            TEST
             │
             ▼
             PHASE 3
             │
             ▼
            TEST
             │
             ▼
             PHASE 4
             │
             ▼
            TEST
             │
             ▼
             PHASE 5
             │
             ▼
            TEST
             │
             ▼
             PHASE 6
             │
             ▼
       PRODUCTION REVIEW





       And one VERY important Antigravity rule

After each phase, don't immediately ask it to "continue."

First inspect its report.

For example, after Phase 1, you want Antigravity to tell you:

Files changed:
...

APIs:
...

Database:
...

Tests:
...

Known issues:
...

Build:
PASS

Workout flow:
PASS

Previous performance:
PASS

Repeat workout:
PASS

Then you manually test the application.

Only when the phase is actually stable should you paste the next phase prompt.



My model strategy
Work	Model
Repository analysis	Gemini 3.6 Flash High
Phase 0 security	Gemini 3.6 Flash High
Phase 1 workout engine	Gemini 3.6 Flash High
Phase 2 data/history	Gemini 3.6 Flash High
Phase 3 analytics	Gemini 3.6 Flash High
Phase 4 fitness intelligence	Gemini 3.6 Flash High
Phase 5 UX/dashboard	Gemini 3.6 Flash High
Phase 6 production hardening	Gemini 3.6 Flash High
Stuck on serious architectural problem	3.1 Pro High

So if you want one model to stick with throughout the project: choose Gemini 3.6 Flash High.

🚨 One rule before you start

Do not paste all seven prompts into Antigravity at once.

Use:

PHASE 0
↓
verify
↓
commit
↓
PHASE 1
↓
verify
↓
commit
↓
PHASE 2
...

The prompts below are deliberately designed as agentic implementation prompts, not ordinary "write some code" prompts.

Each phase tells Antigravity:

Analyze → Plan → Implement → Validate → Report → STOP

That's the behavior you want.