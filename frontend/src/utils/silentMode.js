// Complete Console Silence Mode
const originalConsole = {
  warn: console.warn,
  error: console.error,
  log: console.log,
};

// Override all console methods to be completely silent
console.warn = () => {};
console.error = () => {};

// Only allow specific success messages
console.log = function (...args) {
  const message = args.join(" ");
  if (
    message.includes("✅") ||
    message.includes("Backend connected") ||
    message.includes("Dashboard data loaded")
  ) {
    originalConsole.log.apply(console, args);
  }
};

export default originalConsole;
