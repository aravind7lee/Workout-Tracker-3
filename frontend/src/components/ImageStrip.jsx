import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import SkeletonLoader from "./SkeletonLoader";

export default function ImageStrip({ images = [], name = "Champion", isHovered }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);

  // Auto-play slide
  useEffect(() => {
    if (!isAutoPlaying || images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [isAutoPlaying, images.length]);

  const nextImage = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsAutoPlaying(false);
  };

  const prevImage = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsAutoPlaying(false);
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) nextImage();
      else prevImage();
    }
  };

  return (
    <>
      <div
        className="relative w-full h-80 sm:h-96 md:h-[420px] bg-neutral-950 overflow-hidden select-none group"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background Ambient Blur of current image */}
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-2xl opacity-30 scale-110 pointer-events-none"
          style={{ backgroundImage: `url(${images[currentIndex]})` }}
        />

        {/* Main Foreground Image */}
        <div className="relative w-full h-full flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={images[currentIndex]}
              alt={`${name} photo ${currentIndex + 1}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full object-contain sm:object-cover sm:object-top drop-shadow-2xl"
              loading="lazy"
            />
          </AnimatePresence>
        </div>

        {/* Gradient Shadow overlays for smooth edge blend */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-black/30 pointer-events-none" />

        {/* Navigation Arrows (Clean & Minimal) */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/10 text-white flex items-center justify-center shadow-lg transition-all opacity-80 group-hover:opacity-100 active:scale-90 z-20"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={nextImage}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/10 text-white flex items-center justify-center shadow-lg transition-all opacity-80 group-hover:opacity-100 active:scale-90 z-20"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Bottom Micro Progress Indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`transition-all rounded-full ${
                  idx === currentIndex
                    ? "w-4 h-1.5 bg-orange-400"
                    : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Fullscreen Expand Action */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFullscreen(true);
          }}
          className="absolute bottom-3 right-3 w-7 h-7 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white/80 hover:text-white flex items-center justify-center shadow-md transition-all active:scale-90 z-20"
          aria-label="View Fullscreen"
        >
          <Maximize2 size={13} />
        </button>
      </div>

      {/* Fullscreen Gallery Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-between p-4 sm:p-6"
            onClick={() => setIsFullscreen(false)}
          >
            {/* Header */}
            <div className="w-full flex items-center justify-between z-10" onClick={(e) => e.stopPropagation()}>
              <div className="text-white">
                <h4 className="text-sm sm:text-base font-bold">{name}</h4>
                <p className="text-xs text-neutral-400">Photo {currentIndex + 1} of {images.length}</p>
              </div>
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2.5 rounded-full bg-neutral-900 border border-neutral-800 text-white hover:bg-neutral-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Image */}
            <div className="relative max-w-4xl max-h-[75vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <img
                src={images[currentIndex]}
                alt={`${name} photo`}
                className="max-h-[72vh] max-w-full object-contain rounded-xl shadow-2xl"
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 sm:-left-12 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 border border-white/20 text-white hover:scale-110 transition-transform"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 sm:-right-12 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 border border-white/20 text-white hover:scale-110 transition-transform"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip in Modal */}
            <div
              className="flex items-center gap-2 overflow-x-auto max-w-full pb-2 z-10 scrollbar-none"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                    idx === currentIndex
                      ? "border-orange-500 scale-105 shadow-lg shadow-orange-500/30"
                      : "border-neutral-800 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
