import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LayoutDashboard } from 'lucide-react';

/**
 * Reusable BackToDashboard Component
 * Provides intuitive, one-tap navigation back to the main Dashboard across all sections.
 */
export default function BackToDashboard({
  label = "Back to Dashboard",
  to = "/dashboard",
  className = "",
  variant = "inline", // "inline" | "floating" | "compact" | "subtle"
  onClick = null,
}) {
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();
    if (typeof onClick === 'function') {
      onClick();
    } else {
      navigate(to);
    }
  };

  if (variant === "floating") {
    return (
      <button
        onClick={handleClick}
        type="button"
        title={label}
        aria-label={label}
        className={`fixed top-4 left-4 z-40 group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/80 hover:bg-neutral-900 text-neutral-200 hover:text-white border border-white/10 hover:border-red-500/50 shadow-2xl backdrop-blur-xl transition-all duration-200 hover:scale-105 active:scale-95 text-xs sm:text-sm font-bold ${className}`}
      >
        <ArrowLeft className="w-4 h-4 text-red-500 group-hover:-translate-x-1 transition-transform duration-200" />
        <span className="hidden xs:inline">{label}</span>
        <span className="xs:hidden">Dashboard</span>
      </button>
    );
  }

  if (variant === "compact") {
    return (
      <button
        onClick={handleClick}
        type="button"
        title={label}
        aria-label={label}
        className={`group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-white/10 hover:border-red-500/40 text-xs font-bold transition-all shadow-md active:scale-95 ${className}`}
      >
        <ArrowLeft className="w-3.5 h-3.5 text-red-500 group-hover:-translate-x-0.5 transition-transform duration-200" />
        <span className="hidden xs:inline">{label}</span>
        <span className="xs:hidden">Dashboard</span>
      </button>
    );
  }

  if (variant === "subtle") {
    return (
      <button
        onClick={handleClick}
        type="button"
        title={label}
        aria-label={label}
        className={`group inline-flex items-center gap-1.5 text-neutral-400 hover:text-white text-xs font-bold transition-colors py-1 ${className}`}
      >
        <ArrowLeft className="w-3.5 h-3.5 text-neutral-400 group-hover:text-red-400 group-hover:-translate-x-0.5 transition-all duration-200" />
        <span>{label}</span>
      </button>
    );
  }

  // Default "inline" pill variant
  return (
    <button
      onClick={handleClick}
      type="button"
      title={label}
      aria-label={label}
      className={`group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-white/10 hover:border-red-500/40 text-xs sm:text-sm font-bold tracking-wide transition-all shadow-lg backdrop-blur-md hover:scale-[1.02] active:scale-95 ${className}`}
    >
      <ArrowLeft className="w-4 h-4 text-red-500 group-hover:-translate-x-1 transition-transform duration-200" />
      <span>{label}</span>
    </button>
  );
}
