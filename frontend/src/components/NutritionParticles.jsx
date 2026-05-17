import { Salad, Apple, Nut, Carrot, Grape, Citrus, Leaf, Banana } from 'lucide-react';
import React from "react";
import { motion } from "framer-motion";


export default function NutritionParticles() {
  // Create floating nutrition-themed particles
  const particles = Array.from(
    {
      length: 15,
    },
    (_, i) => ({
      id: i,
      emoji: [
        /*#__PURE__*/ React.createElement(Salad, {
          className: "w-[1em] h-[1em] inline-block",
        }),
        /*#__PURE__*/ React.createElement(Apple, {
          className: "w-[1em] h-[1em] inline-block",
        }),
        /*#__PURE__*/ React.createElement(Nut, {
          className: "w-[1em] h-[1em] inline-block",
        }),
        /*#__PURE__*/ React.createElement(Carrot, {
          className: "w-[1em] h-[1em] inline-block",
        }),
        /*#__PURE__*/ React.createElement(Grape, {
          className: "w-[1em] h-[1em] inline-block",
        }),
        /*#__PURE__*/ React.createElement(Citrus, {
          className: "w-[1em] h-[1em] inline-block",
        }),
        /*#__PURE__*/ React.createElement(Leaf, {
          className: "w-[1em] h-[1em] inline-block",
        }),
        /*#__PURE__*/ React.createElement(Banana, {
          className: "w-[1em] h-[1em] inline-block",
        }),
        /*#__PURE__*/ React.createElement(Leaf, {
          className: "w-[1em] h-[1em] inline-block",
        }),
        /*#__PURE__*/ React.createElement(Grape, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      ][i % 10],
      size: Math.random() * 20 + 15,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 10 + 15,
      delay: Math.random() * 5,
    }),
  );
  return /*#__PURE__*/ React.createElement(
    "div",
    {
      className: "absolute inset-0 pointer-events-none overflow-hidden",
    },
    particles.map((particle) =>
      /*#__PURE__*/ React.createElement(
        motion.div,
        {
          key: particle.id,
          className: "absolute opacity-20 select-none",
          style: {
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            fontSize: `${particle.size}px`,
          },
          animate: {
            y: [0, -30, 0],
            x: [0, 15, -15, 0],
            rotate: [0, 10, -10, 0],
            opacity: [0.1, 0.3, 0.1],
          },
          transition: {
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          },
        },
        particle.emoji,
      ),
    ),
    Array.from(
      {
        length: 8,
      },
      (_, i) =>
        /*#__PURE__*/ React.createElement(motion.div, {
          key: `dot-${i}`,
          className:
            "absolute w-3 h-3 rounded-full bg-gradient-to-r from-red-500/20 to-red-500/20",
          style: {
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          },
          animate: {
            scale: [0.5, 1.2, 0.5],
            opacity: [0.2, 0.6, 0.2],
          },
          transition: {
            duration: 4 + Math.random() * 3,
            delay: Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }),
    ),
    /*#__PURE__*/ React.createElement(
      "svg",
      {
        className: "absolute inset-0 w-full h-full",
      },
      /*#__PURE__*/ React.createElement(
        "defs",
        null,
        /*#__PURE__*/ React.createElement(
          "linearGradient",
          {
            id: "lineGradient",
            x1: "0%",
            y1: "0%",
            x2: "100%",
            y2: "100%",
          },
          /*#__PURE__*/ React.createElement("stop", {
            offset: "0%",
            stopColor: "rgba(34, 197, 94, 0.1)",
          }),
          /*#__PURE__*/ React.createElement("stop", {
            offset: "50%",
            stopColor: "rgba(59, 130, 246, 0.1)",
          }),
          /*#__PURE__*/ React.createElement("stop", {
            offset: "100%",
            stopColor: "rgba(147, 51, 234, 0.1)",
          }),
        ),
      ),
      Array.from(
        {
          length: 3,
        },
        (_, i) =>
          /*#__PURE__*/ React.createElement(motion.path, {
            key: `line-${i}`,
            d: `M${Math.random() * 100},${Math.random() * 100} Q${Math.random() * 100},${Math.random() * 100} ${Math.random() * 100},${Math.random() * 100}`,
            stroke: "url(#lineGradient)",
            strokeWidth: "2",
            fill: "none",
            initial: {
              pathLength: 0,
              opacity: 0,
            },
            animate: {
              pathLength: 1,
              opacity: 0.3,
            },
            transition: {
              duration: 8 + Math.random() * 4,
              delay: Math.random() * 3,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            },
          }),
      ),
    ),
  );
}
