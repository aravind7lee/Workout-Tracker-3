import React, { useState } from "react";
import { Trophy, Globe, Quote, Sparkles, Dumbbell, ChevronRight, Zap, Award } from 'lucide-react';
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ImageStrip from "./ImageStrip";

export default function BuilderCard({ builder, index }) {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const isClassic = builder.category === "Classic Legend";

  const handleExploreSplit = () => {
    navigate("/splits", {
      state: {
        suggestedSearch: builder.name.split(" ")[0],
      },
    });
  };

  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`relative bg-gradient-to-b from-neutral-900/90 via-neutral-950/95 to-black border rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ${
          isClassic
            ? "border-amber-500/25 hover:border-amber-400/70 hover:shadow-amber-500/10"
            : "border-red-500/25 hover:border-red-500/70 hover:shadow-red-500/10"
        }`}
      >
        {/* Photo Gallery Area */}
        <div className="relative">
          <ImageStrip
            images={builder.images}
            name={builder.name}
            isHovered={isHovered}
          />

          {/* Category Badge */}
          <div className="absolute top-3.5 left-3.5 z-10">
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider backdrop-blur-md flex items-center gap-1.5 shadow-xl border ${
                isClassic
                  ? "bg-amber-950/80 border-amber-500/40 text-amber-300"
                  : "bg-red-950/80 border-red-500/40 text-red-300"
              }`}
            >
              {isClassic ? <Trophy size={13} className="text-amber-400" /> : <Globe size={13} className="text-red-400" />}
              {builder.category}
            </span>
          </div>

          {/* Photo Count Pill */}
          <div className="absolute top-3.5 right-3.5 z-10">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-black/70 backdrop-blur-md text-neutral-300 border border-white/10 shadow-lg">
              {builder.images?.length || 0} Photos
            </span>
          </div>
        </div>

        {/* Card Body Information */}
        <div className="p-4 sm:p-6 space-y-4 relative z-10">
          
          {/* Athlete Title Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {builder.titleTag && (
                  <span className="px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-300 text-[10px] font-extrabold uppercase tracking-wider">
                    {builder.titleTag}
                  </span>
                )}
                {builder.achievement && (
                  <span className={`text-xs font-bold flex items-center gap-1 ${isClassic ? "text-amber-400" : "text-orange-400"}`}>
                    <Award size={13} />
                    {builder.achievement}
                  </span>
                )}
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight group-hover:text-amber-200 transition-colors">
                {builder.name}
              </h3>
              <p className="text-xs text-neutral-400 font-medium mt-0.5">{builder.era}</p>
            </div>
          </div>

          {/* Signature Exercises / Routine Highlights */}
          {builder.signatureMoves && (
            <div className="space-y-1.5">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Dumbbell size={12} className="text-orange-400" />
                Signature Movements
              </span>
              <div className="flex flex-wrap gap-1.5">
                {builder.signatureMoves.map((move, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-neutral-900/90 border border-neutral-800 text-[11px] font-medium text-neutral-300 hover:border-neutral-700 transition-colors"
                  >
                    {move}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Sleek Glass Quote */}
          <div
            className={`p-3.5 sm:p-4 rounded-2xl border backdrop-blur-md relative ${
              isClassic
                ? "bg-amber-500/5 border-amber-500/20 border-l-4 border-l-amber-500"
                : "bg-red-500/5 border-red-500/20 border-l-4 border-l-red-500"
            }`}
          >
            <p className="text-xs sm:text-sm text-neutral-200 italic font-medium leading-relaxed">
              "{builder.quote}"
            </p>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex items-center justify-between gap-3 border-t border-neutral-800/80">
            <span className="text-xs text-neutral-400 font-medium hidden xs:inline-flex items-center gap-1">
              <Sparkles size={13} className="text-amber-400" />
              <span>Full Split & Routine Ready</span>
            </span>

            <button
              onClick={handleExploreSplit}
              className={`w-full xs:w-auto py-2.5 px-5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
                isClassic
                  ? "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black shadow-amber-500/20"
                  : "bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-red-500/20"
              }`}
            >
              <Zap size={14} className="fill-current" />
              <span>View Inspired Splits</span>
              <ChevronRight size={14} />
            </button>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
