import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import '../styles/nutrition-gallery.css';

// Import nutrition images
import Nutrition2 from '../assets/Nutrition2.jpg';
import Nutrition4 from '../assets/Nutrition4.jpg';
import Nutrition5 from '../assets/Nutrition5.jpg';
import Nutrition6 from '../assets/Nutrition6.jpg';
import Nutrition7 from '../assets/Nutrition7.jpg';
import Nutrition8 from '../assets/Nutrition8jpg.jpg';

// Skeleton loader component
const ImageSkeleton = () => (
  <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse rounded-2xl" />
);

// Individual nutrition card component
const NutritionCard = ({ image, title, subtitle, description, index }) => {
  const { theme } = useTheme();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageError(true);
    img.src = image;
  }, [image]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.15,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      className="nutrition-card group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl dark:hover:shadow-dark-glow transition-all duration-500 bg-white dark:bg-dark-bg-soft border border-gray-200 dark:border-dark-border backdrop-blur-sm"
    >
      {/* Image Container */}
      <div className="relative h-64 sm:h-72 lg:h-80 overflow-hidden">
        {/* Skeleton Loader */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0">
            <div className="skeleton-loader w-full h-full rounded-2xl" />
          </div>
        )}
        
        {/* Main Image */}
        {!imageError && (
          <motion.img
            src={image}
            alt={title}
            className="nutrition-card-image w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
            style={{ opacity: imageLoaded ? 1 : 0 }}
            loading="lazy"
            decoding="async"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        )}
        
        {/* Error Fallback */}
        {imageError && (
          <div className="w-full h-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
            <div className="text-white text-6xl">🥗</div>
          </div>
        )}
        
        {/* Overlay */}
        <div 
          className="absolute inset-0 transition-all duration-500"
          style={{
            background: theme === 'dark' 
              ? 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.2) 100%)'
              : 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)'
          }}
        />
        
        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          <motion.h3 
            className="nutrition-card-title text-xl sm:text-2xl font-bold mb-2 text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15 + 0.3 }}
          >
            {title}
          </motion.h3>
          
          <motion.p 
            className="nutrition-card-subtitle text-sm sm:text-base text-gray-200 mb-3 font-medium"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15 + 0.4 }}
          >
            {subtitle}
          </motion.p>
          
          <motion.p 
            className="nutrition-card-description text-xs sm:text-sm text-gray-300 opacity-90 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15 + 0.5 }}
          >
            {description}
          </motion.p>
        </div>
        
        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
      description: "Get customized meal recommendations based on your fitness goals and dietary preferences."
    },
    {
      image: Nutrition4,
      title: "Macro Tracking",
      subtitle: "Precision Nutrition",
      description: "Track proteins, carbs, and fats with real-time progress monitoring and goal adjustments."
    },
    {
      image: Nutrition5,
      title: "Food Database",
      subtitle: "Comprehensive Library",
      description: "Access thousands of foods with detailed nutritional information and barcode scanning."
    },
    {
      image: Nutrition6,
      title: "Progress Analytics",
      subtitle: "Data-Driven Results",
      description: "Visualize your nutrition trends and optimize your diet for maximum performance."
    },
    {
      image: Nutrition7,
      title: "Goal Achievement",
      subtitle: "Reach Your Targets",
      description: "Set and achieve your nutrition goals with intelligent tracking and motivational insights."
    },
    {
      image: Nutrition8,
      title: "Healthy Lifestyle",
      subtitle: "Transform Your Life",
      description: "Build sustainable eating habits that support your long-term health and fitness journey."
    }
  ];

  return (
    <section className="nutrition-gallery-container py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-light-text-primary dark:text-dark-text-primary mb-3 sm:mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Nutrition Excellence
          </motion.h2>
          
          <motion.p 
            className="text-sm sm:text-base md:text-lg text-light-text-muted dark:text-dark-text-muted max-w-3xl mx-auto leading-relaxed px-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Discover powerful features designed to transform your nutrition journey with precision tracking, 
            smart insights, and personalized recommendations.
          </motion.p>
        </motion.div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {nutritionData.map((item, index) => (
            <NutritionCard
              key={index}
              image={item.image}
              title={item.title}
              subtitle={item.subtitle}
              description={item.description}
              index={index}
            />
          ))}
        </div>

        {/* Call to Action */}
        <motion.div 
          className="text-center mt-12 sm:mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <motion.button
            onClick={() => {
              const mealInput = document.querySelector('[data-meal-input]');
              if (mealInput) {
                mealInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => {
                  const input = mealInput.querySelector('input');
                  if (input) input.focus();
                }, 500);
              }
            }}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Your Nutrition Journey
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}