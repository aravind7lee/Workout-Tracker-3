# Workout Tracker Premium Design System

## 1. Brand Identity
- **Vibe**: Premium, Athletic, Minimalist, Data-Driven, High-End.
- **Concept**: A sophisticated digital gym partner. Clean lines, massive typography for metrics, and highly intentional use of color.

## 2. Color Palette (Dark Theme First)
- **Background**: Deep obsidian (`#0F172A`) for main application backgrounds.
- **Surfaces**: Elevated grays (`#1E293B`, `#334155`) for cards, modals, and dropdowns.
- **Primary Accent**: Electric Blue (`#3B82F6` or `#0EA5E9`) used sparingly for primary CTAs (Start Workout, Save Plan) and active states (current exercise row).
- **Semantic Colors**:
  - **Success / PR**: Emerald Green (`#10B981`) for completed sets and Personal Records.
  - **Warning**: Amber (`#F59E0B`) for destructive confirmations (Abandon Workout).
  - **Error**: Crimson Red (`#EF4444`) for validation errors.
  - **Rest / Paused**: Muted Indigo (`#6366F1`) for rest timers and paused states.
- **Text**: 
  - Primary text: High-contrast white (`#F8FAFC`).
  - Secondary text / Metadata: Muted gray (`#94A3B8`).

## 3. Typography (Inter or Roboto)
- **Display**: Massive sizes (48px+) for active timers, current reps, and PR metrics. Bold and tight tracking.
- **Headings**: Clean, structural headings (24px - 32px) for page titles and section headers.
- **Body**: Highly readable (14px - 16px) with generous line height for instructions and notes.
- **Labels**: Uppercase, tight tracking, small size (12px) for metadata (e.g., "WEIGHT", "REPS", "REST").

## 4. Layout & Spacing (8pt Grid)
- **Micro Spacing**: 4px, 8px between text and icons.
- **Component Spacing**: 16px padding inside cards and buttons.
- **Section Spacing**: 32px or 48px between major layout groups.
- **Mobile Considerations**: Generous touch targets (min 48px height) for all interactable elements during a workout.

## 5. Components
- **Cards**: Soft borders (`1px solid rgba(255, 255, 255, 0.1)`), 16px border-radius, subtle surface glow instead of drop shadows in dark mode.
- **Buttons**:
  - Primary: Solid Electric Blue background, white text, subtle hover lift.
  - Secondary: Transparent background, 1px solid border, subtle hover fill.
  - FABs (Floating Action Buttons): Circular, elevated, used for the Rest Timer.
- **Inputs & Forms**: Darker inputs (`#020617`), borderless until focus, then ringed with Primary Accent.

## 6. Real-Time & Active Workout UI
- **Active Set**: Clearly delineated from pending/completed sets via surface brightness and accent border.
- **Progress Visualization**: SVG rings for nutrition/macros; minimalist line/bar charts for volume trends.

## 7. Motion & Interaction
- Fast, purposeful state transitions (150ms).
- Immediate visual feedback (color pulse) when a set is completed.
