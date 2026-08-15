// Safe module loading utilities
export const suppressError = (error) => {
  return null;
};

export const safeImport = async (modulePath) => {
  try {
    return await import(/* @vite-ignore */ modulePath);
  } catch (error) {
    console.warn(`Module ${modulePath} failed to import:`, error);
    return null;
  }
};

export default { suppressError, safeImport };

