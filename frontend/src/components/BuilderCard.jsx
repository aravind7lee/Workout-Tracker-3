import { Trophy, Globe, Quote } from 'lucide-react';
import React, { useState } from "react";
import { motion } from "framer-motion";

import ImageStrip from "./ImageStrip";

const BuilderCard = ({ builder, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  const isClassicLegend = builder.category === "Classic Legend";

  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`relative bg-gradient-to-br from-black/90 to-neutral-900/90 backdrop-blur-sm rounded-2xl overflow-hidden border transition-all duration-200 ${
          isClassicLegend ? "border-yellow-500/20" : "border-red-600/20"
        }`}
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
            <h3 className="text-xl font-bold text-white leading-tight">
              {builder.name}
            </h3>
            <p className="text-sm text-gray-400 font-medium">{builder.era}</p>
          </div>

          {/* Quote Section */}
          <div className="relative">
            <div
              className={`relative p-4 rounded-xl ${
                isClassicLegend
                  ? "bg-yellow-500/10 border border-yellow-500/20"
                  : "bg-red-600/10 border border-red-600/20"
              }`}
            >
              <Quote
                size={16}
                className={`absolute top-2 left-2 ${
                  isClassicLegend ? "text-yellow-400" : "text-red-500"
                }`}
              />
              <blockquote
                className={`text-sm font-medium leading-relaxed pl-6 ${
                  isClassicLegend ? "text-yellow-100" : "text-blue-100"
                }`}
              >
                "{builder.quote}"
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BuilderCard;
