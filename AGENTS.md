# Workout Tracker - AI Agent Instructions

This document is the permanent instruction manual for any AI agent interacting with this project. Read this before modifying any code.

## 1. Golden Rules
- **Do not assume:** Never assume planned features are already implemented. Always verify by reading the actual source code.
- **No blind refactoring:** Do not refactor existing code unless explicitly requested by the user. If you see messy code that works, leave it alone unless asked to clean it.
- **Preserve existing functionality:** Ensure your changes do not break the current workflows, especially the core workout session and authentication flows.
- **Read before writing:** If asked to modify a feature, read the relevant frontend pages (in `frontend/src/pages/`) and backend routes/controllers (in `backend/routes/` and `backend/models/`) first.

## 2. Project Overview
- **Stack:** MERN (MongoDB, Express, React, Node.js)
- **Frontend Tooling:** Vite, Tailwind CSS, React Router v6, Axios, Framer Motion, Recharts/Chart.js
- **Backend Tooling:** Express, Mongoose, JWT, Cloudinary

## 3. Safety & DB Rules
- Do not run destructive database commands (drop, deleteMany) unless absolutely necessary and explicitly requested.
- If writing new MongoDB models, follow the existing schema style and include timestamps.
- Ensure all API endpoints meant for users use the appropriate authentication middleware.

## 4. Development Workflow
- **Frontend:** Runs on port 5173 (usually via `npm run dev`).
- **Backend:** Runs on port 5000 (usually via `npm start` or `npm run dev` with nodemon).
- Test UI changes by verifying Tailwind class additions don't break existing layouts.
- Be aware of the `utils/comprehensiveErrorHandler.js` and other global error handlers in the frontend that might suppress some console logs.

## 5. UI/UX Rules
- Use `lucide-react` for icons. Do not introduce new icon libraries unless asked.
- Stick to the existing Tailwind theme colors (dark mode dominant, bg-gray-800/900, text-white/gray-300).
- Keep animations subtle using Framer Motion (`framer-motion`) or basic Tailwind transitions.

## 6. Project Context
For a detailed breakdown of the existing architecture, database models, and API routes, always refer to `skill.md`.
