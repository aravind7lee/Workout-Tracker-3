import React, { useState, useEffect, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

// Import all 6 analytics images
import Analytics1 from '../assets/Analytics1.jpg';
import Analytics2 from '../assets/Analytics2.jpg';
import Analytics3 from '../assets/Analytics3.jpg';
import Analytics4 from '../assets/Analytics4.jpg';
import Analytics5 from '../assets/Analytics5.jpg';
import Analytics6 from '../assets/Analytics6.jpg';

// Analytics gallery data with meaningful content
const analyticsItems = [
  {
    id: 1,
    image: Analytics1,
    title: "Workout Performance Tracking",
    subtitle: "Monitor your strength gains and endurance improvements",
    description: "Track your progress across all exercises with detailed performance metrics and visual charts."
  },
  {
    id: 2,
    image: Analytics2,
    title: "Body Composition Analysis",
    subtitle: "Visualize your body transformation journey",
    description: "Advanced body composition tracking with muscle mass, body fat percentage, and weight trends."
  },
  {
    id: 3,
    image: Analytics3,
    title: "Nutrition & Calorie Insights",
    subtitle: "Optimize your diet with smart analytics",
    description: "Comprehensive nutrition tracking with macro breakdowns and calorie burn analysis."
  },
  {
    id: 4,
    image: Analytics4,
    title: "Workout Frequency & Consistency",
    subtitle: "Build lasting fitness habits",
    description: "Track your workout consistency, streaks, and frequency patterns to maintain motivation."
  },
  {
    id: 5,
    image: Analytics5,
    title: "Goal Achievement Progress",
    subtitle: "Reach your fitness milestones faster",
    description: "Set and track personalized fitness goals with progress indicators and achievement badges."
  },
  {
    id: 6,
    image: Analytics6,
    title: "Advanced Performance Metrics",
    subtitle: "Deep dive into your fitness data",
    description: "Comprehensive analytics including heart rate zones, recovery metrics, and performance predictions."
  }
];

// Skeleton loader component with improved accessibility
const ImageSkeleton = ({ className }) => (
  <div 
    className={`animate-pulse bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 bg-[length:200%_100%] ${className}`}
    role="img"
    aria-label="Loading image"
  >
    <div className="animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent h-full w-full"></div>
  </div>
);

// Individual analytics card component
const AnalyticsCard = ({ item, index }) => {
  const { theme } = useTheme();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true); // Show fallback content
  }, []);

  useEffect(() => {
    const img = new Image();
    img.onload = handleImageLoad;
    img.onerror = handleImageError;
    img.src = item.image;
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [item.image, handleImageLoad, handleImageError]);

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 60,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const imageVariants = {
    hidden: { scale: 1.1, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.4, delay: 0.2 }
    }
  };

  return (
    <motion.div
      ref={ref}
      variants={cardVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      className={`analytics-gallery-card group backdrop-blur-sm shadow-2xl ${
        theme === 'dark' 
          ? 'bg-slate-800/50 border border-slate-700/50' 
          : 'bg-white/10 border border-white/20'
      }`}
      tabIndex={0}
      role="article"
      aria-labelledby={`analytics-title-${item.id}`}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {/* Skeleton Loader */}
        {!imageLoaded && !imageError && (
          <ImageSkeleton className="absolute inset-0 rounded-t-2xl" />
        )}
        
        {/* Main Image */}
        {imageLoaded && !imageError && (
          <motion.img
            variants={imageVariants}
            initial="hidden"
            animate="visible"
            src={item.image}
            alt={`${item.title} - ${item.subtitle}`}
            className="analytics-gallery-image"
            loading="lazy"
            decoding="async"
            width="400"
            height="300"
          />
        )}
        
        {/* Error Fallback */}
        {imageError && (
          <div className={`absolute inset-0 flex items-center justify-center ${
            theme === 'dark' ? 'bg-slate-700' : 'bg-slate-300'
          }`}>
            <div className="text-center">
              <div className="text-sm text-slate-400">Image unavailable</div>
            </div>
          </div>
        )}
        
        {/* Gradient Overlay */}
        <motion.div
          variants={overlayVariants}
          className={`absolute inset-0 ${
            theme === 'dark'
              ? 'bg-gradient-to-t from-black/80 via-black/40 to-transparent'
              : 'bg-gradient-to-t from-black/70 via-black/30 to-transparent'
          }`}
        />
        

      </div>
      
      {/* Content */}
      <motion.div
        variants={overlayVariants}
        className="analytics-gallery-content space-y-3"
      >
        <motion.h3
          id={`analytics-title-${item.id}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 + 0.4, duration: 0.5 }}
          className="analytics-gallery-title font-bold text-white group-hover:text-blue-400 transition-colors duration-300"
        >
          {item.title}
        </motion.h3>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 + 0.5, duration: 0.5 }}
          className={`analytics-gallery-subtitle font-medium ${
            theme === 'dark' ? 'text-blue-300' : 'text-blue-200'
          }`}
        >
          {item.subtitle}
        </motion.p>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 + 0.6, duration: 0.5 }}
          className={`analytics-gallery-description leading-relaxed ${
            theme === 'dark' ? 'text-slate-300' : 'text-slate-200'
          }`}
        >
          {item.description}
        </motion.p>
        
        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 + 0.7, duration: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`mt-4 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
              : 'bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-800 hover:to-purple-800 text-white'
          } shadow-lg hover:shadow-xl`}
          aria-label={`Learn more about ${item.title}`}
        >
          Learn More
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

// Main Analytics Gallery Component
const AnalyticsGallery = () => {
  const { theme } = useTheme();
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const titleVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <motion.section
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="analytics-gallery-container"
    >
      {/* Section Header */}
      <motion.div
        variants={titleVariants}
        className="text-center mb-12"
      >
        <motion.h2
          className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
          style={{
            background: theme === 'dark' 
              ? 'linear-gradient(135deg, #3b82f6, #8b5cf6, #06b6d4)'
              : 'linear-gradient(135deg, #1e40af, #7c3aed, #0891b2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          Analytics Features
        </motion.h2>
        <motion.p
          variants={titleVariants}
          className={`text-lg max-w-3xl mx-auto ${
            theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
          }`}
        >
          Discover powerful insights and track your fitness journey with our comprehensive analytics suite
        </motion.p>
      </motion.div>

      {/* Analytics Grid */}
      <div className="analytics-gallery-grid">
        {analyticsItems.map((item, index) => (
          <AnalyticsCard key={item.id} item={item} index={index} />
        ))}
      </div>

      {/* Bottom CTA Section */}
      <motion.div
        variants={titleVariants}
        className="text-center mt-16"
      >
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className={`px-8 py-4 rounded-xl font-semibold text-white shadow-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
              : 'bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-800 hover:to-purple-800'
          }`}
          style={{
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)'
          }}
          onClick={() => {
            const analyticsSection = document.getElementById('analytics-charts');
            if (analyticsSection) {
              analyticsSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          aria-label="Navigate to analytics dashboard section"
        >
          Explore Your Analytics Dashboard
        </motion.button>
      </motion.div>
    </motion.section>
  );
};

export default AnalyticsGallery;