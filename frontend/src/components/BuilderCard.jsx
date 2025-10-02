import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Globe, Quote } from 'lucide-react';
import ImageStrip from './ImageStrip';

const BuilderCard = ({ builder, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  const isClassicLegend = builder.category === 'Classic Legend';

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: index * 0.1,
        ease: "easeOut"
      }
    }
  };

  const hoverVariants = {
    rest: {
      scale: 1,
      rotateY: 0,
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)"
    },
    hover: {
      scale: 1.02,
      rotateY: 2,
      boxShadow: isClassicLegend 
        ? "0 20px 60px rgba(255, 215, 0, 0.3), 0 0 30px rgba(255, 215, 0, 0.2)"
        : "0 20px 60px rgba(59, 130, 246, 0.3), 0 0 30px rgba(59, 130, 246, 0.2)",
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const quoteVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative"
    >
      <motion.div
        variants={hoverVariants}
        className={`relative bg-gradient-to-br ${
          isClassicLegend 
            ? 'from-slate-900/90 to-slate-800/90 border-yellow-500/20' 
            : 'from-slate-900/90 to-slate-800/90 border-blue-500/20'
        } backdrop-blur-sm rounded-2xl overflow-hidden border transition-all duration-300`}
        style={{
          background: isHovered 
            ? isClassicLegend
              ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))'
              : 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))'
            : 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9))'
        }}
      >


        {/* Image Strip */}
        <div className="relative">
          <ImageStrip 
            images={builder.images} 
            name={builder.name}
            isHovered={isHovered}
          />
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Name and Era */}
          <div className="space-y-2">
            <motion.h3 
              className="text-xl font-bold text-white leading-tight"
              animate={isHovered ? { scale: 1.02 } : { scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {builder.name}
            </motion.h3>
            <p className="text-sm text-gray-400 font-medium">
              {builder.era}
            </p>
          </div>

          {/* Quote Section */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 + 0.4 }}
          >
            <div className={`relative p-4 rounded-xl ${
              isClassicLegend 
                ? 'bg-yellow-500/10 border border-yellow-500/20' 
                : 'bg-blue-500/10 border border-blue-500/20'
            }`}>
              <Quote 
                size={16} 
                className={`absolute top-2 left-2 ${
                  isClassicLegend ? 'text-yellow-400' : 'text-blue-400'
                }`} 
              />
              <blockquote 
                className={`text-sm font-medium leading-relaxed pl-6 ${
                  isClassicLegend ? 'text-yellow-100' : 'text-blue-100'
                }`}
                style={{
                  textShadow: isClassicLegend 
                    ? '0 0 10px rgba(255, 215, 0, 0.3)' 
                    : '0 0 10px rgba(59, 130, 246, 0.3)'
                }}
              >
                "{builder.quote}"
              </blockquote>
            </div>
          </motion.div>
        </div>


      </motion.div>
    </motion.div>
  );
};

export default BuilderCard;