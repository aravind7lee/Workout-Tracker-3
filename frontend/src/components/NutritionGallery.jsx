import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Salad, Sparkles, Utensils, Target, Layers, ArrowUpRight } from 'lucide-react';
import "../styles/nutrition-gallery.css";

// Import nutrition images
import Nutrition2 from "../assets/Nutrition2.jpg";
import Nutrition4 from "../assets/Nutrition4.jpg";
import Nutrition5 from "../assets/Nutrition5.jpg";
import Nutrition6 from "../assets/Nutrition6.jpg";
import Nutrition7 from "../assets/Nutrition7.jpg";
import Nutrition8 from "../assets/Nutrition8jpg.jpg";

const NutritionCard = ({ image, title, subtitle, description, targetId, index }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageError(true);
    img.src = image;
  }, [image]);

  const handleScrollToTarget = () => {
    if (!targetId) return;
    const elem = document.querySelector(targetId);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth", block: "center" });
      elem.classList.add("ring-2", "ring-orange-500/50");
      setTimeout(() => {
        elem.classList.remove("ring-2", "ring-orange-500/50");
      }, 1500);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onClick={handleScrollToTarget}
      className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-neutral-800 bg-neutral-900 shadow-xl hover:border-orange-500/50 transition-all cursor-pointer active:scale-98"
    >
      <div className="relative h-44 sm:h-56 lg:h-64 overflow-hidden">
        {!imageLoaded && !imageError && (
          <div className="skeleton-loader w-full h-full rounded-xl sm:rounded-2xl bg-neutral-800 animate-pulse" />
        )}
        
        {!imageError && (
          <motion.img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
            style={{ opacity: imageLoaded ? 1 : 0 }}
            loading="lazy"
            decoding="async"
          />
        )}

        {imageError && (
          <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
            <Salad className="w-10 h-10 text-orange-500/50" />
          </div>
        )}

        {/* Ambient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

        {/* Top-Right Quick Jump Badge */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-7 h-7 rounded-full bg-orange-500/80 text-white flex items-center justify-center shadow-lg">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        {/* Card Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-3.5 sm:p-5">
          <span className="text-[8px] sm:text-[10px] font-bold text-orange-400 uppercase tracking-widest block mb-0.5">
            {subtitle}
          </span>
          <h3 className="text-sm sm:text-lg font-black text-white leading-tight mb-1 group-hover:text-orange-200 transition-colors">
            {title}
          </h3>
          <p className="text-[10px] sm:text-xs text-neutral-300 line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default function NutritionGallery() {
  const nutritionData = [
    {
      image: Nutrition2,
      title: "Smart Meal Planning",
      subtitle: "Personalized Nutrition",
      description: "Get customized meal recommendations tailored to your fitness goals and daily macros.",
      targetId: "#nutrition-search-input",
    },
    {
      image: Nutrition4,
      title: "Macro Tracking",
      subtitle: "Precision Fueling",
      description: "Monitor proteins, carbs, and fats with live progress rings and dynamic target adjustments.",
      targetId: '[data-progress-section="true"]',
    },
    {
      image: Nutrition5,
      title: "Comprehensive Food Database",
      subtitle: "Nutritionix API Powered",
      description: "Instant access to verified nutrition profiles and high-protein gym foods.",
      targetId: ".food-categories-container",
    },
    {
      image: Nutrition6,
      title: "Progress Analytics",
      subtitle: "Data-Driven Performance",
      description: "Visualize calorie balance and macro distribution to optimize muscular recovery.",
      targetId: '[data-analytics-section="true"]',
    },
    {
      image: Nutrition7,
      title: "Goal Achievement",
      subtitle: "Hit Your Targets",
      description: "Stay consistent with cutting, bulking, or maintenance targets calibrated to your training.",
      targetId: ".tdee-calculator-card",
    },
    {
      image: Nutrition8,
      title: "Healthy Habits",
      subtitle: "Long-Term Results",
      description: "Build sustainable dietary discipline that powers peak athletic endurance.",
      targetId: "#hydration-tracker-section",
    },
  ];

  return (
    <section className="py-4 sm:py-8 lg:py-10 max-w-6xl mx-auto px-3 sm:px-4 md:px-6">
      <div className="space-y-1 mb-4 sm:mb-6 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-1.5 text-orange-500 font-bold text-[9px] sm:text-xs uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5" /> Nutrition Pillars
        </div>
        <h2 className="text-base sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
          Precision Nutrition Architecture
        </h2>
        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-neutral-400">
          Core capabilities engineered for bodybuilding, endurance, and wellness. Tap any pillar to jump directly.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 lg:gap-5">
        {nutritionData.map((item, index) => (
          <NutritionCard
            key={item.title}
            {...item}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}
