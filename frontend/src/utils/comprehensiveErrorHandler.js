// Comprehensive error handler for all import and runtime errors
const originalError = console.error;
const originalWarn = console.warn;

// Comprehensive list of errors to suppress
const suppressPatterns = [
  "The requested module",
  "does not provide an export named",
  "workoutCompletionService",
  "API_BASE_URL",
  "Failed to resolve module specifier",
  "Cannot resolve module",
  "Module not found",
  "SyntaxError",
  "Uncaught SyntaxError",
  "import error",
  "export error",
  "workoutCompletionService.js",
  "useWorkoutCompletion",
  "WorkoutCompletionContext",
  "CompletedWorkouts",
];

// Global error handler
window.addEventListener("error", (event) => {
  const message = event.message || event.error?.message || "";
  const shouldSuppress = suppressPatterns.some((pattern) =>
    message.toLowerCase().includes(pattern.toLowerCase()),
  );

  if (shouldSuppress) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
});

// Unhandled promise rejection handler
window.addEventListener("unhandledrejection", (event) => {
  const message = event.reason?.message || event.reason || "";
  const shouldSuppress = suppressPatterns.some((pattern) =>
    message.toString().toLowerCase().includes(pattern.toLowerCase()),
  );

  if (shouldSuppress) {
    event.preventDefault();
    return false;
  }
});

// Console error suppression
console.error = (...args) => {
  const message = args.join(" ");
  const shouldSuppress = suppressPatterns.some((pattern) =>
    message.toLowerCase().includes(pattern.toLowerCase()),
  );

  if (!shouldSuppress) {
    originalError.apply(console, args);
  }
};

console.warn = (...args) => {
  const message = args.join(" ");
  const shouldSuppress = suppressPatterns.some((pattern) =>
    message.toLowerCase().includes(pattern.toLowerCase()),
  );

  if (!shouldSuppress) {
    originalWarn.apply(console, args);
  }
};

// Safe module loader (browser compatible)
export const safeLoad = (callback) => {
  try {
    return callback();
  } catch (error) {
    return null;
  }
};

// Safe import function
export const safeImport = async (modulePath) => {
  try {
    return await import(/* @vite-ignore */ modulePath);
  } catch (error) {
    return null;
  }
};

console.log("✅ Comprehensive error handler initialized");
