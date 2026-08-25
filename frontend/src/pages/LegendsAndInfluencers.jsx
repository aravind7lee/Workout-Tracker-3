import React, { useState, useEffect, useMemo } from "react";
import { ArrowRight, Trophy, Globe, Star, Zap, Search, Sparkles, Filter, Dumbbell } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

import BuilderCard from "../components/BuilderCard";
import SkeletonLoader from "../components/SkeletonLoader";
import "../styles/legends.css";

// Import hero header image
import ChampsHeader from "../assets/Champsheader.jpg";

// Import legend images
import Arnold1 from "../assets/Arnold Schwarzenegge1.jpg";
import Arnold2 from "../assets/Arnold Schwarzenegge2.jpg";
import Arnold3 from "../assets/Arnold Schwarzenegge3.jpg";
import Arnold4 from "../assets/Arnold Schwarzenegge4.jpg";
import Arnold5 from "../assets/Arnold Schwarzenegge5.jpg";
import Arnold6 from "../assets/Arnold Schwarzenegge6.jpg";
import Arnold7 from "../assets/Arnold Schwarzenegge7.jpg";
import Arnold8 from "../assets/Arnold Schwarzenegge8.jpg";
import Arnold9 from "../assets/Arnold Schwarzenegge9.jpg";
import Ronnie1 from "../assets/RonnieColeman.jpg";
import Ronnie2 from "../assets/RonnieColeman2.jpg";
import Ronnie3 from "../assets/RonnieColeman3.jpeg";
import Ronnie4 from "../assets/RonnieColeman4.jpg";
import Ronnie5 from "../assets/RonnieColeman5.jpeg";
import Mike1 from "../assets/Mike Mentzer1.jpg";
import Mike2 from "../assets/Mike Mentzer2.jpg";
import Mike3 from "../assets/Mike Mentzer3.jpg";
import Mike4 from "../assets/Mike Mentzer4.jpg";
import Mike5 from "../assets/Mike Mentzer5.jpg";
import Mike6 from "../assets/Mike Mentzer6.jpg";
import Mike7 from "../assets/Mike Mentzer7.png";
import Mike8 from "../assets/Mike Mentzer8.jpg";
import Jay1 from "../assets/JayCutler.jpg";
import Jay2 from "../assets/JayCutler2.jpg";
import Jay3 from "../assets/JayCutler3.jpg";
import Jay4 from "../assets/JayCutler4.jpg";

// Import modern influencer images
import Chris1 from "../assets/ChrisBumstead1.jpg";
import Chris2 from "../assets/ChrisBumstead2.jpg";
import Chris3 from "../assets/ChrisBumstead3.jpg";
import Chris4 from "../assets/ChrisBumstead4.jpg";
import Chris5 from "../assets/ChrisBumstead5.jpg";
import Chris6 from "../assets/ChrisBumstead6.jpg";
import Chris7 from "../assets/ChrisBumstead7.jpg";
import Chris8 from "../assets/ChrisBumstead8.jpg";
import Chris9 from "../assets/ChrisBumstead9.jpg";
import David1 from "../assets/DavidLaid1.jpg";
import David2 from "../assets/DavidLaid2.jpg";
import David3 from "../assets/DavidLaid3.jpg";
import David4 from "../assets/DavidLaid4.jpg";
import David5 from "../assets/DavidLaid5.jpg";
import DavidLaid from "../assets/David laid.jpg";
import Jeff1 from "../assets/JeffSeid1.jpg";
import Jeff2 from "../assets/JeffSeid2.jpg";
import Jeff3 from "../assets/JeffSeid3.jpg";
import Sam1 from "../assets/SamSulek.jpg";
import Sam2 from "../assets/SamSulek2.jpg";
import Sam3 from "../assets/SamSulek3.jpg";
import Sam4 from "../assets/SamSulek4.jpg";

const ALL_BUILDERS = [
  {
    id: "arnold",
    name: "Arnold Schwarzenegger",
    category: "Classic Legend",
    achievement: "7x Mr. Olympia",
    titleTag: "The Austrian Oak",
    signatureMoves: ["Arnold Press", "Incline DB Press", "T-Bar Row", "Donkey Calf Raises"],
    images: [
      Arnold1, Arnold2, Arnold3, Arnold4, Arnold5,
      Arnold6, Arnold7, Arnold8, Arnold9,
    ],
    quote: "The worst thing I can be is the same as everybody else. I hate that.",
    era: "1970s-1980s",
  },
  {
    id: "ronnie",
    name: "Ronnie Coleman",
    category: "Classic Legend",
    achievement: "8x Mr. Olympia",
    titleTag: "King of Heavy Weight",
    signatureMoves: ["800lb Deadlift", "Barbell Rows", "T-Bar Row", "Heavy DB Bench"],
    images: [Ronnie1, Ronnie2, Ronnie3, Ronnie4, Ronnie5],
    quote: "Everybody wants to be a bodybuilder, but nobody wants to lift no heavy-ass weights.",
    era: "1990s-2000s",
  },
  {
    id: "mike",
    name: "Mike Mentzer",
    category: "Classic Legend",
    achievement: "Heavy Duty Pioneer",
    titleTag: "High Intensity Titan",
    signatureMoves: ["Heavy Duty Incline Press", "Pre-Exhaust Pullovers", "Leg Extensions"],
    images: [Mike1, Mike2, Mike3, Mike4, Mike5, Mike6, Mike7, Mike8],
    quote: "The quality of training is more important than the quantity.",
    era: "1970s-1980s",
  },
  {
    id: "jay",
    name: "Jay Cutler",
    category: "Classic Legend",
    achievement: "4x Mr. Olympia",
    titleTag: "The Quad Stomp Icon",
    signatureMoves: ["Quad Stomp Squats", "DB Pullovers", "FST-7 Cable Flyes"],
    images: [Jay1, Jay2, Jay3, Jay4],
    quote: "Success is usually the culmination of controlling failure.",
    era: "2000s-2010s",
  },
  {
    id: "chris",
    name: "Chris Bumstead (CBum)",
    category: "Modern Influencer",
    achievement: "5x Classic Olympia Champ",
    titleTag: "Classic Physique GOAT",
    signatureMoves: ["Incline Smith Press", "Preacher Curls", "Hack Squat", "Romanian Deadlift"],
    images: [
      Chris1, Chris2, Chris3, Chris4, Chris5,
      Chris6, Chris7, Chris8, Chris9,
    ],
    quote: "It's not about being the biggest. It's about building the best version of yourself.",
    era: "2010s-Present",
  },
  {
    id: "david",
    name: "David Laid",
    category: "Modern Influencer",
    achievement: "Transformation Icon",
    titleTag: "Aesthetic Movement",
    signatureMoves: ["Heavy Deadlift", "Overhead Press", "Incline DB Press", "Weighted Dips"],
    images: [David1, David2, David3, David4, David5, DavidLaid],
    quote: "Transform your physique, transform your life.",
    era: "2010s-Present",
  },
  {
    id: "jeff",
    name: "Jeff Seid",
    category: "Modern Influencer",
    achievement: "Youngest IFBB Pro",
    titleTag: "Aesthetic Phenom",
    signatureMoves: ["Incline Flyes", "Side Lateral Raises", "EZ Bar Curls", "Skull Crushers"],
    images: [Jeff1, Jeff2, Jeff3],
    quote: "Don't count the days — make the days count.",
    era: "2010s-Present",
  },
  {
    id: "sam",
    name: "Sam Sulek",
    category: "Modern Influencer",
    achievement: "Raw Heavy Lifting Icon",
    titleTag: "Daily Grind Phenom",
    signatureMoves: ["Heavy Incline Press", "Cable Tricep Pushdowns", "Single-Arm Lat Pulldown"],
    images: [Sam1, Sam2, Sam3, Sam4],
    quote: "Progress is built one rep at a time.",
    era: "2020s-Present",
  },
];

export default function LegendsAndInfluencers() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    const img = new Image();
    img.src = ChampsHeader;

    return () => clearTimeout(timer);
  }, []);

  const filteredBuilders = useMemo(() => {
    return ALL_BUILDERS.filter((b) => {
      const matchesCategory =
        activeCategory === "all" ||
        (activeCategory === "classic" && b.category === "Classic Legend") ||
        (activeCategory === "modern" && b.category === "Modern Influencer");

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        b.name.toLowerCase().includes(q) ||
        b.era.toLowerCase().includes(q) ||
        b.achievement.toLowerCase().includes(q) ||
        b.titleTag.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  if (isLoading) {
    return <SkeletonLoader variant="page" />;
  }

  return (
    <div className="min-h-screen bg-black text-white pb-36 sm:pb-28 overflow-x-hidden">
      
      {/* 1. HERO SECTION */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative w-full min-h-[80vh] h-[80vh] sm:h-[85vh] lg:h-[88vh] flex items-center justify-center overflow-hidden border-b border-neutral-800/80 shadow-2xl bg-black"
      >
        <img
          src={ChampsHeader}
          alt="Gym Champions and Legends"
          className="w-full h-full object-cover object-top sm:object-[center_top] filter brightness-105 contrast-100 saturate-105"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/50 pointer-events-none" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-6 max-w-5xl mx-auto space-y-4 sm:space-y-6 z-10">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/80 border border-neutral-700/80 backdrop-blur-md text-amber-400 text-xs sm:text-sm font-black uppercase tracking-wider shadow-2xl">
            <Trophy size={14} className="text-amber-400" />
            <span>Hall of Fame • Gym Champs</span>
          </div>

          <h1 className="text-4xl xs:text-5xl sm:text-6xl lg:text-7xl font-black bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 bg-clip-text text-transparent uppercase tracking-wider drop-shadow-2xl font-heading">
            LEGENDS & CHAMPS
          </h1>

          <p className="text-sm sm:text-base lg:text-xl text-neutral-200 font-medium max-w-xs sm:max-w-2xl mx-auto drop-shadow-md leading-relaxed">
            Learn from the icons and modern champions who shaped bodybuilding and fitness culture.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mt-4 w-full max-w-[280px] sm:max-w-none mx-auto">
            <button
              onClick={() => {
                document.getElementById("champs-directory")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="premium-btn-primary btn-primary preserve-color w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <span>Explore Champions</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
            
            <button
              onClick={() => navigate("/splits")}
              className="premium-btn-secondary btn-secondary preserve-color w-full sm:w-auto"
            >
              View Inspired Splits
            </button>
          </div>

        </div>
      </motion.section>

      {/* 2. STATS OVERVIEW BANNER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 bg-neutral-950/95 backdrop-blur-xl border border-neutral-800/90 rounded-2xl p-4 shadow-2xl">
          <div className="text-center p-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-400">8</span>
            <p className="text-[10px] sm:text-xs text-neutral-400 font-bold uppercase tracking-wider mt-0.5">Iconic Champions</p>
          </div>
          <div className="text-center p-2">
            <span className="text-2xl sm:text-3xl font-black text-red-500">24+</span>
            <p className="text-[10px] sm:text-xs text-neutral-400 font-bold uppercase tracking-wider mt-0.5">Olympia Titles</p>
          </div>
          <div className="text-center p-2">
            <span className="text-2xl sm:text-3xl font-black text-orange-400">50+</span>
            <p className="text-[10px] sm:text-xs text-neutral-400 font-bold uppercase tracking-wider mt-0.5">Archive Photos</p>
          </div>
          <div className="text-center p-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400">100%</span>
            <p className="text-[10px] sm:text-xs text-neutral-400 font-bold uppercase tracking-wider mt-0.5">Elite Motivation</p>
          </div>
        </div>
      </div>

      {/* 3. MAIN DIRECTORY SECTION */}
      <div id="champs-directory" className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 space-y-8">
        
        {/* Category Tabs & Instant Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-900 pb-6">
          
          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                activeCategory === "all"
                  ? "bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-600/30 scale-105"
                  : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
              }`}
            >
              🔥 All Champs ({ALL_BUILDERS.length})
            </button>
            <button
              onClick={() => setActiveCategory("classic")}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                activeCategory === "classic"
                  ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-extrabold shadow-lg shadow-amber-500/30 scale-105"
                  : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
              }`}
            >
              🏆 Classic Legends (4)
            </button>
            <button
              onClick={() => setActiveCategory("modern")}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                activeCategory === "modern"
                  ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/30 scale-105"
                  : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
              }`}
            >
              🌐 Modern Influencers (4)
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search champs, era, titles, moves..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-8 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

        </div>

        {/* Champs Cards Grid / List */}
        {filteredBuilders.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-neutral-950 border border-neutral-800 rounded-3xl p-6">
            <Trophy className="w-10 h-10 text-amber-400 mx-auto" />
            <h3 className="text-base font-bold text-white">No Champions Found</h3>
            <p className="text-xs text-neutral-400">Try searching for a different name or era.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("all");
              }}
              className="px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {filteredBuilders.map((builder, index) => (
              <BuilderCard key={builder.id} builder={builder} index={index} />
            ))}
          </div>
        )}

      </div>

    </div>
  );
}
