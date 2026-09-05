import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Chart, registerables } from "chart.js";
import AuthGuard from "../components/AuthGuard";
import RealAnalyticsSection from "../components/RealAnalyticsSection";
import progressAnalyticsImg from "../assets/Progress-Analytics.jpg";
import "../styles/analytics-mobile.css";

Chart.register(...registerables);

function AnalyticsHero() {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageError(true);
    img.src = progressAnalyticsImg;
    img.loading = "eager";
  }, []);

  return (
    <div className="theme-dark-surface analytics-hero relative h-80 sm:h-96 w-full overflow-hidden mb-6">
      <div className="absolute inset-0">
        {!imageError && (
          <img
            src={progressAnalyticsImg}
            alt="Progress & Analytics"
            className="analytics-hero-mobile w-full h-full object-cover transition-opacity duration-300"
            loading="eager"
            style={{ opacity: imageLoaded ? 1 : 0 }}
          />
        )}
        {imageError && (
          <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 absolute inset-0" />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)",
          }}
        />
      </div>
      {imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <motion.div
            className="text-center max-w-4xl w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1
              className="text-3xl sm:text-5xl md:text-6xl font-black mb-3 text-orange-500 drop-shadow-2xl"
              style={{
                textShadow: "0 4px 20px rgba(0,0,0,0.9), 0 2px 8px rgba(0,0,0,0.7)",
              }}
            >
              Progress & Analytics
            </h1>
            <p
              className="text-sm sm:text-lg text-white font-medium drop-shadow-lg max-w-xl mx-auto"
              style={{
                textShadow: "0 2px 12px rgba(0,0,0,0.8)",
              }}
            >
              Track your fitness journey with real MongoDB Atlas workout performance data
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default function Analytics() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-black text-white relative overflow-hidden pb-16">
        <AnalyticsHero />
        <RealAnalyticsSection />
      </div>
    </AuthGuard>
  );
}
