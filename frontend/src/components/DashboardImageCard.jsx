import React, { useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const DashboardImageCard = ({ 
  image, 
  title, 
  description, 
  primaryButton, 
  secondaryButton, 
  gradient,
  glowColor,
  badgeText,
  badgeIcon
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
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
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
        staggerChildren: 0.2
      }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={`relative overflow-hidden rounded-2xl group hover:shadow-2xl hover:shadow-${glowColor}/30 transition-all duration-700 transform hover:-translate-y-2`}
    >
      <div className="relative h-64 xs:h-72 sm:h-80 md:h-96 lg:h-[420px] xl:h-[450px]">
        {/* Skeleton Loader */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-slate-800 animate-pulse">
            <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-slate-600 border-t-slate-400 rounded-full animate-spin"></div>
                  <div className="text-slate-400 text-xs sm:text-sm font-medium">Loading...</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Image */}
        <motion.img 
          src={image} 
          alt={title}
          className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-90 group-hover:brightness-100 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          initial={{ scale: 1.1 }}
          animate={{ scale: imageLoaded ? 1 : 1.1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />

        {/* Mobile-Optimized Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/20 sm:from-slate-900/95 sm:via-slate-900/70 sm:to-transparent group-hover:from-black/90 dark:from-black/98 dark:via-black/80"></div>
        


        {/* Mobile-Optimized Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-3 xs:p-4 sm:p-6 lg:p-8">
          <motion.div 
            variants={contentVariants}
            className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500"
          >
        

            {/* Mobile-Optimized Title */}
            <motion.h3 
              variants={contentVariants}
              className={`text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-4 bg-gradient-to-r ${gradient} bg-clip-text text-transparent leading-tight`}
            >
              {title}
            </motion.h3>

            {/* Mobile-Optimized Description */}
            <motion.p 
              variants={contentVariants}
              className="text-sm xs:text-base sm:text-lg text-slate-200 mb-3 sm:mb-6 leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity duration-500 line-clamp-2 sm:line-clamp-none"
            >
              {description}
            </motion.p>

            {/* Mobile-Optimized Buttons */}
            {primaryButton && secondaryButton && (
              <motion.div 
                variants={buttonVariants}
                className="flex flex-col gap-2 sm:flex-row sm:gap-3"
              >
                <motion.button 
                  onClick={primaryButton.onClick}
                  className={`bg-gradient-to-r ${primaryButton.gradient} text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm flex-1 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-${primaryButton.color}/25 flex items-center justify-center gap-2`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {primaryButton.text}
                </motion.button>
                
                <motion.button 
                  onClick={secondaryButton.onClick}
                  className={`bg-gradient-to-r ${secondaryButton.gradient} text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm flex-1 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-${secondaryButton.color}/25 flex items-center justify-center gap-2`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {secondaryButton.text}
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardImageCard;