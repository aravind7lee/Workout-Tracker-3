import React from "react";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle({ className = "" }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.94 }}
      onClick={toggleTheme}
      className={`theme-nav-toggle ${className}`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <motion.span
        key={isDark ? "moon" : "sun"}
        initial={{ opacity: 0, rotate: -60, scale: 0.7 }}
        animate={{ opacity: 1, rotate: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {isDark ? <Moon size={17} /> : <Sun size={18} />}
      </motion.span>
    </motion.button>
  );
}
