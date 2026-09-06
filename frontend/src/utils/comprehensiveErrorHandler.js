// Safe Error Handler Utility
export const safeLoad = (callback) => {
  try {
    return callback();
  } catch (error) {
    console.error("[SafeLoad Error]:", error);
    return null;
  }
};

export const safeImport = async (modulePath) => {
  try {
    return await import(/* @vite-ignore */ modulePath);
  } catch (error) {
    console.warn(`[SafeImport Warning] Module ${modulePath} failed to load:`, error);
    return null;
  }
};

// Filter known harmless third-party library warnings (e.g. Recharts defaultProps in React 18+)
if (typeof window !== "undefined") {
  const originalWarn = console.warn;
  const originalError = console.error;
  const filterPatterns = [
    /Support for defaultProps will be removed/i,
    /XAxis: Support for defaultProps/i,
    /YAxis: Support for defaultProps/i,
  ];

  console.warn = (...args) => {
    if (typeof args[0] === "string" && filterPatterns.some((pattern) => pattern.test(args[0]))) {
      return;
    }
    originalWarn.apply(console, args);
  };

  console.error = (...args) => {
    if (typeof args[0] === "string" && filterPatterns.some((pattern) => pattern.test(args[0]))) {
      return;
    }
    originalError.apply(console, args);
  };
}

export default { safeLoad, safeImport };

