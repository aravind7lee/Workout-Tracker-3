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

export default { safeLoad, safeImport };

