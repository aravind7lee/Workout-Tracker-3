import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Trophy, Globe, Star, Zap } from 'lucide-react';

import BuilderCard from '../components/BuilderCard';
import SkeletonLoader from '../components/SkeletonLoader';
import '../styles/legends.css';

// Import hero header image
import ChampsHeader from '../assets/Champsheader.jpg';

// Import legend images
import Arnold1 from '../assets/Arnold Schwarzenegge1.jpg';
import Arnold2 from '../assets/Arnold Schwarzenegge2.jpg';
import Arnold3 from '../assets/Arnold Schwarzenegge3.jpg';
import Arnold4 from '../assets/Arnold Schwarzenegge4.jpg';
import Arnold6 from '../assets/Arnold Schwarzenegge6.jpg';
import Ronnie1 from '../assets/RonnieColeman.jpg';
import Ronnie2 from '../assets/RonnieColeman2.jpg';
import Ronnie4 from '../assets/RonnieColeman4.jpg';
import Mike1 from '../assets/Mike Mentzer1.jpg';
import Mike2 from '../assets/Mike Mentzer2.jpg';
import Mike4 from '../assets/Mike Mentzer4.jpg';
import Mike6 from '../assets/Mike Mentzer6.jpg';
import Mike7 from '../assets/Mike Mentzer7.png';
import Mike8 from '../assets/Mike Mentzer8.jpg';
import Jay1 from '../assets/JayCutler.jpg';
import Jay2 from '../assets/JayCutler2.jpg';
import Jay3 from '../assets/JayCutler3.jpg';
import Jay4 from '../assets/JayCutler4.jpg';

// Import modern influencer images
import Chris1 from '../assets/ChrisBumstead1.jpg';
import Chris2 from '../assets/ChrisBumstead2.jpg';
import Chris3 from '../assets/ChrisBumstead3.jpg';
import Chris4 from '../assets/ChrisBumstead4.jpg';
import Chris5 from '../assets/ChrisBumstead5.jpg';
import Chris6 from '../assets/ChrisBumstead6.jpg';
import David1 from '../assets/DavidLaid1.jpg';
import David2 from '../assets/DavidLaid2.jpg';
import David3 from '../assets/DavidLaid3.jpg';
import David4 from '../assets/DavidLaid4.jpg';
import David5 from '../assets/DavidLaid5.jpg';
import DavidLaid from '../assets/David laid.jpg';
import Jeff1 from '../assets/JeffSeid1.jpg';
import Jeff2 from '../assets/JeffSeid2.jpg';
import Jeff3 from '../assets/JeffSeid3.jpg';
import Sam1 from '../assets/SamSulek.jpg';
import Sam2 from '../assets/SamSulek2.jpg';
import Sam3 from '../assets/SamSulek3.jpg';
import Sam4 from '../assets/SamSulek4.jpg';

const buildersData = {
  classicLegends: [
    {
      id: 'arnold',
      name: 'Arnold Schwarzenegger',
      category: 'Classic Legend',
      images: [Arnold1, Arnold2, Arnold3, Arnold4, Arnold6],
      quote: "The worst thing I can be is the same as everybody else. I hate that.",
      era: '1970s-1980s'
    },
    {
      id: 'ronnie',
      name: 'Ronnie Coleman',
      category: 'Classic Legend',
      images: [Ronnie1, Ronnie2, Ronnie4],
      quote: "Everybody wants to be a bodybuilder, but nobody wants to lift no heavy-ass weights.",
      era: '1990s-2000s'
    },
    {
      id: 'mike',
      name: 'Mike Mentzer',
      category: 'Classic Legend',
      images: [Mike1, Mike2, Mike4, Mike6, Mike7, Mike8],
      quote: "The quality of training is more important than the quantity.",
      era: '1970s-1980s'
    },
    {
      id: 'jay',
      name: 'Jay Cutler',
      category: 'Classic Legend',
      images: [Jay1, Jay2, Jay3, Jay4],
      quote: "Success is usually the culmination of controlling failure.",
      era: '2000s-2010s'
    }
  ],
  modernInfluencers: [
    {
      id: 'chris',
      name: 'Chris Bumstead (Cbum)',
      category: 'Modern Influencer',
      images: [Chris1, Chris2, Chris3, Chris4, Chris5, Chris6],
      quote: "It's not about being the biggest. It's about building the best version of yourself.",
      era: '2010s-Present'
    },
    {
      id: 'david',
      name: 'David Laid',
      category: 'Modern Influencer',
      images: [David1, David2, David3, David4, David5, DavidLaid],
      quote: "Transform your physique, transform your life.",
      era: '2010s-Present'
    },
    {
      id: 'jeff',
      name: 'Jeff Seid',
      category: 'Modern Influencer',
      images: [Jeff1, Jeff2, Jeff3],
      quote: "Don't count the days — make the days count.",
      era: '2010s-Present'
    },
    {
      id: 'sam',
      name: 'Sam Sulek',
      category: 'Modern Influencer',
      images: [Sam1, Sam2, Sam3, Sam4],
      quote: "Progress is built one rep at a time.",
      era: '2020s-Present'
    }
  ]
};

const LegendsAndInfluencers = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    // Simulate loading time for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    // Preload hero image
    const img = new Image();
    img.onload = () => setImagesLoaded(true);
    img.src = ChampsHeader;

    return () => clearTimeout(timer);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }

    
  };

  if (isLoading) {
    return <SkeletonLoader variant="page" />;
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-white overflow-hidden">


      {/* Hero Header Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative w-full min-h-screen flex items-center justify-center"
      >
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 w-full h-full">
          <img 
            src={ChampsHeader}
            alt="Champions Header"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 text-center px-4 w-full max-w-6xl mx-auto">
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
             <motion.h1 
              className="text-5xl md:text-7xl lg:text-8xl font-black text-amber-300 mb-2 sm:mb-3 drop-shadow-lg font-heading"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Legends & Influencers
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl lg:text-3xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-extrabold hero-text-primary drop-shadow-lg font-heading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Learn from the icons who shaped bodybuilding & fitness culture
            </motion.p>

            <motion.div
              className="flex items-center justify-center space-x-8 pt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="flex items-center space-x-2 text-yellow-400">
                <Trophy size={24} />
                <span className="text-xl font-extrabold hero-text-primary drop-shadow-lg font-heading">Classic Legends</span>
              </div>
              <div className="w-px h-8 bg-gray-600" />
              <div className="flex items-center space-x-2 text-blue-400">
                <Globe size={24} />
                <span className="text-xl font-extrabold hero-text-primary drop-shadow-lg font-heading">Modern Influencers</span>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </motion.section>

      {/* Scroll Indicator - Below hero section */}
      <motion.button
        className="relative left-1/2 transform -translate-x-1/2 -mt-20 z-30 cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ 
          opacity: { duration: 0.6, delay: 0.8 },
          y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}
        onClick={() => {
          document.getElementById('content-section')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }}
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center hover:border-white/50 transition-colors">
          <div className="w-1 h-3 bg-white/60 rounded-full mt-2" />
        </div>
      </motion.button>

      {/* Main Content */}
      <div id="content-section" className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Classic Legends Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="py-20"
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Trophy className="text-yellow-400" size={32} />
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Classic Legends
              </h2>
              <Trophy className="text-yellow-400" size={32} />
            </div>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              The pioneers who built the foundation of modern bodybuilding
            </p>
          </motion.div>

          <div className="space-y-12">
            {buildersData.classicLegends.map((builder, index) => (
              <BuilderCard key={builder.id} builder={builder} index={index} />
            ))}
          </div>
        </motion.section>

        {/* Modern Influencers Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="py-20"
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Globe className="text-blue-400" size={32} />
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Modern Influencers
              </h2>
              <Globe className="text-blue-400" size={32} />
            </div>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Today's champions inspiring the next generation
            </p>
          </motion.div>

          <div className="space-y-12">
            {buildersData.modernInfluencers.map((builder, index) => (
              <BuilderCard key={builder.id} builder={builder} index={index} />
            ))}
          </div>
        </motion.section>

        {/* Call to Action Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="py-20 text-center"
        >
          <div className="bg-gradient-to-r from-slate-900/50 to-slate-800/50 backdrop-blur-sm rounded-3xl p-12 border border-slate-700/50">
            <motion.div
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Get Inspired. Build Your Legacy.
              </h3>
              <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                Channel the dedication of legends and create your own transformation story
              </p>
              
              <Link to="/plans">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
                >
                  <Zap size={24} />
                  <span>Start Your Workout Plan</span>
                  <ArrowRight size={24} />
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default LegendsAndInfluencers;