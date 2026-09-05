# Workout Tracker - Project Context & Knowledge Base

This document contains the actual, current state of the Workout Tracker project. It serves as a practical knowledge base for AI agents.

## 1. Project Overview & Purpose
A full-stack web application designed for users to create workout plans, track exercise sessions, monitor nutrition, analyze their progress, and engage with a community forum. 

## 2. Frontend Structure & Technologies
- **Framework:** React 18 with Vite.
- **Routing:** React Router v6.
- **Styling:** Tailwind CSS.
- **Icons & UI:** `lucide-react`, `framer-motion`, `@tsparticles/react`.
- **State/Fetching:** React Context API (Theme, Auth, RealTime, WorkoutCompletion), Axios, `dayjs`.
- **Charts:** `recharts`, `chart.js`, `react-chartjs-2`.
- **Structure:**
  - `src/pages/`: Contains all route components (e.g., Dashboard, Home, WorkoutSession, Analytics, Nutrition, Library, Profile, Forum).
  - `src/components/`: Reusable UI components.
  - `src/context/`: Global state management (`AuthContext`, `ThemeContext`, `RealTimeContext`).
  - `src/utils/`: Error handling (`comprehensiveErrorHandler.js`), silent modes, cleanup utilities.

## 3. Backend Structure & Technologies
- **Server:** Node.js with Express.
- **Database:** MongoDB (via Mongoose).
- **Authentication:** JWT (`jsonwebtoken`), `bcryptjs`.
- **Storage:** Cloudinary (via `multer-storage-cloudinary`) for image uploads.
- **Security & Middleware:** `helmet`, `cors`, `express-rate-limit`.
- **Structure:**
  - `models/`: Mongoose schemas.
  - `routes/`: Express route definitions.
  - `services/`, `middleware/`, `config/`, `scripts/`.

## 4. Database Structure (MongoDB Models)
Currently implemented models:
- `User`: Handles authentication, profile info, streaks.
- `Plan`: User-created workout plans.
- `Workout`: Logged workout sessions.
- `Exercise`: Global database of exercises.
- `WorkoutSplit`: Custom workout splits.
- `Food` & `Meal`: Nutrition tracking.
- `NutritionGoal`: User specific dietary goals.
- `Post` & `Review`: Community and rating features.
- `Achievement`: Gamification elements.

## 5. Available API Routes
- `/api/auth`: Login, register, token validation.
- `/api/users`: Profile management, streaks.
- `/api/exercises`: Exercise search and details.
- `/api/plans`: Workout plan creation/editing.
- `/api/workouts`: Starting, logging, and finishing workout sessions.
- `/api/workout-splits`: Managing splits.
- `/api/meals` & `/api/nutrition`: Diet logging and tracking.
- `/api/analytics` & `/api/dashboard`: Aggregated data for charts.
- `/api/reviews`: Exercise/plan reviews.
- `/api/forum`: Community posts.
- `/api/sse`: Server-Sent Events for real-time updates.
- `/api/intelligence`: AI/Recommendation logic.
- `/api/sync`: Data synchronization.

## 6. Main Features Currently Implemented
- **Authentication:** Registration, Login, JWT-based persistence.
- **Workout Flow:** Creating a plan/split -> Starting a session -> Logging sets/reps/weight -> Completing workout -> Saving to history.
- **Nutrition:** Tracking daily calories and macros against goals.
- **Analytics:** Visualizing past workouts, volume lifted, and streak history.
- **Library:** Searchable database of exercises.
- **Social:** Basic forum for user posts and reviews on exercises.

## 7. Data Flow & Workflow
1. **User Action (Frontend):** User interacts with a page (e.g., saves a workout).
2. **Context/State:** React state updates, `Axios` formats the request.
3. **API Call:** Request is sent to backend (e.g., `POST /api/workouts`).
4. **Backend Middleware:** CORS, Rate Limiting, and JWT Auth middleware validate the request.
5. **Controller/Route:** Express parses data and invokes Mongoose models.
6. **Database:** MongoDB saves the document.
7. **Response:** Server replies with JSON success/failure.
8. **UI Update:** React re-renders with the new data or navigates to a new route.

## 8. Known Quirks / Important Notes
- **Global Error Suppressions:** The frontend includes specific scripts like `comprehensiveErrorHandler`, `silentMode`, and `errorSuppression` which catch/suppress certain console errors to keep the UI clean.
- **Hardcoded Data:** Some fallback data or initial state might exist directly in the UI components if API calls fail (e.g., in `ExerciseDetail.jsx`).
- **Rate Limiting:** The backend has strict rate limiters applied to auth routes.
- **Image Handling:** All images are routed through Cloudinary; ensure `CLOUDINARY_URL` / keys are properly maintained in `.env`.
