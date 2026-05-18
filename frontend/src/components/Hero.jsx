import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useRealTime } from "../context/RealTimeContext";
import Heroimg from "../assets/Heroimg.jpg";
import logo from "../assets/logo.png";

// ─────────────────────────────────────────────────────────────────────────────
// Scroll Zoom Hero — Professional Edition
// ─────────────────────────────────────────────────────────────────────────────
export default function Hero() {
  const { isAuthenticated } = useAuth();
  const { isOnline } = useRealTime();

  const heroRef = useRef(null);

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 768px)").matches
      : false,
  );
  const [showContent, setShowContent] = useState(false);

  // ── Accessibility & Performance Tracking ──────────────────────
  useEffect(() => {
    // Check reduced motion
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(motionMq.matches);
    const handleMotion = (e) => setReducedMotion(e.matches);
    motionMq.addEventListener("change", handleMotion);

    // Check mobile (<= 768px)
    const mobileMq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mobileMq.matches);
    const handleMobile = (e) => setIsMobile(e.matches);
    mobileMq.addEventListener("change", handleMobile);

    return () => {
      motionMq.removeEventListener("change", handleMotion);
      mobileMq.removeEventListener("change", handleMobile);
    };
  }, []);

  // ── Preload hero image at highest priority ─────────────────────────────
  useEffect(() => {
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageError(true);
    img.fetchPriority = "high";
    img.src = Heroimg;
  }, []);

  // Ensure content always reveals gracefully and never gets blocked
  useEffect(() => {
    if (imageLoaded || imageError) {
      setShowContent(true);
    }
  }, [imageLoaded, imageError]);

  useEffect(() => {
    // 350ms safety fallback to guarantee animations start instantly even on slow connections/cached loads
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 350);
    return () => clearTimeout(timer);
  }, []);

  // ── Scroll tracking (hero section only) ───────────────────────────────
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // ── Spring smoothing for buttery 60fps ────────────────────────────────
  const smooth = useSpring(scrollYProgress, {
    stiffness: reducedMotion ? 1000 : 75,
    damping: reducedMotion ? 100 : 20,
    restDelta: 0.001,
  });

  // ── Cinematic scroll-driven transforms ────────────────────────────────
  const bgScale = useTransform(
    smooth,
    [0, 1],
    [1, reducedMotion || isMobile ? 1.05 : 1.32],
  );
  const bgBlurVal = useTransform(
    smooth,
    [0, 0.75],
    [0, reducedMotion || isMobile ? 0 : 20],
  );
  const bgFilter = useTransform(bgBlurVal, (v) => `blur(${v}px)`);
  const bgOpacity = useTransform(smooth, [0, 0.8], [1, isMobile ? 0.3 : 0]);

  // Overlay darkens as you scroll
  const overlayOp = useTransform(smooth, [0, 0.65], [0.2, 0.85]);

  // Red vignette swells
  const vignetteOp = useTransform(smooth, [0, 0.55], [0.25, 0.9]);

  // Content floats up and fades
  const contentOp = useTransform(smooth, [0, 0.42], [1, 0]);
  const contentY = useTransform(smooth, [0, 0.42], ["0%", "-10%"]);

  // Scroll cue fades immediately
  const arrowOp = useTransform(smooth, [0, 0.1], [1, 0]);

  // LQIP base64 tiny preview
  const LQIP =
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";

  // ── Entry animation variants ───────────────────────────────────────────
  const stagger = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.14, delayChildren: 0.25 },
    },
  };
  const rise = {
    hidden: {
      opacity: 0,
      y: isMobile ? 12 : 28,
      filter: reducedMotion || isMobile ? "none" : "blur(6px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: reducedMotion || isMobile ? "none" : "blur(0px)",
      transition: {
        duration: isMobile ? 0.45 : 0.75,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };
  const lineGrow = {
    hidden: { scaleX: 0, opacity: 0 },
    visible: {
      scaleX: 1,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section
      ref={heroRef}
      className="relative w-full overflow-hidden"
      style={{ height: "100vh", minHeight: "100svh" }}
      aria-label="GrindX Hero"
    >
      {/* ════════════════════════════════════════════════════════════════
          SCROLL-ZOOM BACKGROUND LAYER
      ════════════════════════════════════════════════════════════════ */}
      <motion.div
        className="absolute inset-0 w-full h-full"
        style={{
          scale: bgScale,
          ...(isMobile ? {} : { filter: bgFilter }),
          opacity: bgOpacity,
          transformOrigin: "center center",
          willChange: isMobile
            ? "opacity, transform"
            : "transform, filter, opacity",
        }}
      >
        {/* LQIP blurred placeholder - removed after load for performance */}
        {!imageLoaded && (
          <img
            src={LQIP}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "blur(10px)", transform: "scale(1.05)" }}
          />
        )}

        {/* Full-res hero image */}
        {!imageError && (
          <img
            src={Heroimg}
            alt="GrindX — Elite Fitness Gym"
            fetchPriority="high"
            decoding="async"
            loading="eager"
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{
              opacity: imageLoaded ? 1 : 0,
              transition: "opacity 0.6s ease",
            }}
          />
        )}

        {/* Error fallback */}
        {imageError && (
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-red-950/40 to-black" />
        )}
      </motion.div>

      {/* ════════════════════════════════════════════════════════════════
          OVERLAY STACK — cinematic depth
      ════════════════════════════════════════════════════════════════ */}

      {/* 1. Base black — scrolls darker */}
      <motion.div
        className="absolute inset-0 bg-black pointer-events-none"
        style={{ opacity: overlayOp }}
      />

      {/* 2. Static gradient — always ensures text legibility */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.10) 100%)",
        }}
      />

      {/* 3. Red cinematic vignette — blooms on scroll */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 110% 80% at 50% 110%, rgba(120,0,0,0.75) 0%, transparent 62%)",
          opacity: vignetteOp,
        }}
      />

      {/* 4. Subtle top vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 100% 55% at 50% 0%, rgba(0,0,0,0.6) 0%, transparent 70%)",
        }}
      />

      {/* ════════════════════════════════════════════════════════════════
          CORNER ACCENT MARKS
      ════════════════════════════════════════════════════════════════ */}
      {[
        "top-5 left-5 border-t-2 border-l-2",
        "top-5 right-5 border-t-2 border-r-2",
        "bottom-5 left-5 border-b-2 border-l-2",
        "bottom-5 right-5 border-b-2 border-r-2",
      ].map((cls, i) => (
        <div
          key={i}
          className={`absolute z-10 pointer-events-none w-6 h-6 sm:w-8 sm:h-8 border-red-700/50 ${cls}`}
        />
      ))}

      {/* Horizontal scan line */}
      <div
        className="absolute left-0 right-0 z-10 pointer-events-none"
        style={{
          bottom: "20%",
          height: "1px",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(185,28,28,0.5) 40%, rgba(185,28,28,0.5) 60%, transparent 100%)",
        }}
      />

      {/* ════════════════════════════════════════════════════════════════
          HERO CONTENT — scrolls up and fades
      ════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showContent && (
          <motion.div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center"
            style={{ y: contentY, opacity: contentOp }}
          >
            <motion.div
              className="w-full text-center px-5 sm:px-10 lg:px-16"
              variants={stagger}
              initial="hidden"
              animate="visible"
              style={{ maxWidth: "900px", margin: "0 auto" }}
            >
              {/* ── Eyebrow label ──────────────────────────────────── */}
              <motion.div
                className="flex items-center justify-center gap-3 mb-5 sm:mb-6"
                variants={rise}
              >
                <motion.div
                  className="h-px bg-red-600"
                  style={{ width: 40, originX: 0 }}
                  variants={lineGrow}
                />
                <span
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.28em",
                    color: "#ef4444",
                    fontWeight: 800,
                    textTransform: "uppercase",
                  }}
                >
                  Elite Fitness Tracker
                </span>
                <motion.div
                  className="h-px bg-red-600"
                  style={{ width: 40, originX: 1 }}
                  variants={lineGrow}
                />
              </motion.div>

              {/* ── Main heading block ─────────────────────────────── */}
              <motion.div variants={rise}>
                {/* "Welcome to" — refined, not oversized */}
                <p
                  style={{
                    fontSize: "clamp(0.85rem, 2.2vw, 1.4rem)",
                    color: "rgba(255,255,255,0.72)",
                    fontWeight: 500,
                    letterSpacing: "0.35em",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                    textShadow: "0 2px 12px rgba(0,0,0,0.9)",
                  }}
                >
                  Welcome to
                </p>

                {/* Logo Image Replacement for Peak AURA */}
                <motion.div
                  className="flex justify-center items-center w-full"
                  style={{ marginBottom: "15px", marginTop: "5px" }}
                >
                  <motion.img
                    src={logo}
                    alt="GrindX Logo"
                    className="w-[85%] sm:w-[70%] md:w-[60%] lg:w-[50%] xl:w-[45%] max-w-[600px] h-auto object-contain"
                    style={{
                      filter: isMobile
                        ? "drop-shadow(0 4px 12px rgba(0,0,0,0.9))"
                        : "drop-shadow(0 10px 40px rgba(0,0,0,0.9)) drop-shadow(0 0 40px rgba(220,38,38,0.3))",
                    }}
                    animate={
                      reducedMotion || isMobile
                        ? {}
                        : {
                            filter: [
                              "drop-shadow(0 10px 40px rgba(0,0,0,0.9)) drop-shadow(0 0 30px rgba(220,38,38,0.25))",
                              "drop-shadow(0 10px 40px rgba(0,0,0,0.9)) drop-shadow(0 0 60px rgba(220,38,38,0.65))",
                              "drop-shadow(0 10px 40px rgba(0,0,0,0.9)) drop-shadow(0 0 30px rgba(220,38,38,0.25))",
                            ],
                          }
                    }
                    transition={{
                      duration: 3.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </motion.div>

                {/* Red underline accent */}
                <motion.div
                  style={{
                    height: "3px",
                    background:
                      "linear-gradient(90deg, transparent, #dc2626 30%, #dc2626 70%, transparent)",
                    marginTop: "10px",
                    marginBottom: "20px",
                    originX: 0.5,
                  }}
                  variants={lineGrow}
                />
              </motion.div>

              {/* ── Tagline ────────────────────────────────────────── */}
              <motion.p
                variants={rise}
                style={{
                  fontSize: "clamp(0.78rem, 1.8vw, 1rem)",
                  color: "rgba(228,228,231,0.8)",
                  fontWeight: 400,
                  lineHeight: 1.7,
                  maxWidth: "440px",
                  margin: "0 auto 32px",
                  textShadow: "0 2px 10px rgba(0,0,0,0.85)",
                }}
              >
                Track workouts, monitor progress, and{" "}
                <span style={{ color: "#f87171", fontWeight: 700 }}>
                  dominate
                </span>{" "}
                your fitness goals with precision.
              </motion.p>

              {/* ── CTA Buttons ────────────────────────────────────── */}
              <motion.div
                variants={rise}
                className="flex flex-row items-center justify-center gap-3 sm:gap-4 flex-wrap"
              >
                {/* Primary — red */}
                <motion.div
                  whileHover={reducedMotion ? {} : { scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Link
                    to={isAuthenticated?.() ? "/dashboard" : "/register"}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      background:
                        "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
                      color: "#fff",
                      fontWeight: 800,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      fontSize: "clamp(10px, 1.5vw, 12px)",
                      padding: "13px 30px",
                      border: "1px solid rgba(255,100,100,0.25)",
                      boxShadow:
                        "0 0 24px rgba(185,28,28,0.45), 0 4px 20px rgba(0,0,0,0.7)",
                      transition: "all 0.3s ease",
                      textDecoration: "none",
                    }}
                  >
                    {isAuthenticated?.() ? "Go to Dashboard" : "Start Training"}
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 13 13"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M1 6.5h11M7 1l5 5.5-5 5.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </motion.div>

                {/* Secondary — glass */}
                <motion.div
                  whileHover={reducedMotion ? {} : { scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Link
                    to="/library"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      background: "rgba(255,255,255,0.07)",
                      color: "rgba(255,255,255,0.9)",
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      fontSize: "clamp(10px, 1.5vw, 12px)",
                      padding: "13px 30px",
                      border: "1px solid rgba(255,255,255,0.18)",
                      backdropFilter: isMobile ? "none" : "blur(12px)",
                      WebkitBackdropFilter: isMobile ? "none" : "blur(12px)",
                      boxShadow: isMobile
                        ? "none"
                        : "0 4px 20px rgba(0,0,0,0.5)",
                      transition: "all 0.3s ease",
                      textDecoration: "none",
                    }}
                  >
                    Exercise Library
                  </Link>
                </motion.div>
              </motion.div>

              {/* ── Live sync badge ────────────────────────────────── */}
              {isAuthenticated?.() && isOnline && (
                <motion.div
                  variants={rise}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    marginTop: "24px",
                    padding: "6px 14px",
                    background: "rgba(0,0,0,0.5)",
                    border: "1px solid rgba(185,28,28,0.3)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                  }}
                >
                  <motion.span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "#4ade80",
                      display: "inline-block",
                    }}
                    animate={{ opacity: [1, 0.25, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 800,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: "#4ade80",
                    }}
                  >
                    Real-time sync active
                  </span>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════════════
          LOADING SPINNER (while image fetches)
      ════════════════════════════════════════════════════════════════ */}
      {!imageLoaded && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-neutral-950">
          <div
            style={{
              width: 40,
              height: 40,
              border: "2px solid #dc2626",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 0.75s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          SCROLL INDICATOR
      ════════════════════════════════════════════════════════════════ */}
      <motion.button
        className="absolute left-1/2 z-20 flex flex-col items-center gap-1 focus:outline-none"
        style={{
          bottom: "28px",
          x: "-50%",
          opacity: arrowOp,
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
        onClick={() =>
          window.scrollBy({
            top: window.innerHeight * 0.88,
            behavior: "smooth",
          })
        }
        aria-label="Scroll down"
      >
        <span
          style={{
            fontSize: "9px",
            fontWeight: 800,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.4)",
          }}
        >
          Scroll
        </span>
        {/* Triple bouncing chevrons */}
        <div className="flex flex-col items-center" style={{ gap: 1 }}>
          {[0, 1, 2].map((i) => (
            <motion.svg
              key={i}
              width="18"
              height="11"
              viewBox="0 0 18 11"
              fill="none"
              aria-hidden="true"
              animate={
                reducedMotion
                  ? {}
                  : { opacity: [0.15, 0.9, 0.15], y: [0, 5, 0] }
              }
              transition={{
                duration: 1.5,
                delay: i * 0.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <path
                d="M1 1.5l8 7 8-7"
                stroke="#dc2626"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          ))}
        </div>
      </motion.button>
    </section>
  );
}
