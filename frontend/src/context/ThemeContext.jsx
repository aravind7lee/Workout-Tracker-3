import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);
const STORAGE_KEY = "theme";

const getInitialTheme = () => {
  if (typeof window === "undefined") return "dark";
  const savedTheme = window.localStorage.getItem(STORAGE_KEY);
  return savedTheme === "light" ? "light" : "dark";
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(getInitialTheme);

  const setTheme = useCallback((nextTheme) => {
    setThemeState(nextTheme === "light" ? "light" : "dark");
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const isDark = theme === "dark";

    root.classList.toggle("dark", isDark);
    root.classList.toggle("light", !isDark);
    root.setAttribute("data-theme", theme);
    root.style.colorScheme = theme;
    body.classList.toggle("dark-theme", isDark);
    body.classList.toggle("light-theme", !isDark);
    body.classList.add("theme-transition");
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo(() => ({ theme, isDark: theme === "dark", setTheme, toggleTheme }), [setTheme, theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return { theme: "dark", isDark: true, setTheme: () => {}, toggleTheme: () => {} };
  }
  return context;
};

export default ThemeContext;
