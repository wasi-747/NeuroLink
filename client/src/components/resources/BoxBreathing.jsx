import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Square } from "lucide-react";

const BoxBreathing = () => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState("ready"); // ready, inhale, hold1, exhale, hold2
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    let timer;
    if (isActive) {
      if (phase === "ready") {
        setPhase("inhale");
        setTimeLeft(4);
      } else if (timeLeft > 0) {
        timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      } else {
        if (phase === "inhale") {
          setPhase("hold1");
          setTimeLeft(4);
        } else if (phase === "hold1") {
          setPhase("exhale");
          setTimeLeft(4);
        } else if (phase === "exhale") {
          setPhase("hold2");
          setTimeLeft(4);
        } else if (phase === "hold2") {
          setPhase("inhale");
          setTimeLeft(4);
        }
      }
    }
    return () => clearTimeout(timer);
  }, [isActive, phase, timeLeft]);

  const toggleExercise = () => {
    if (isActive) {
      setIsActive(false);
      setPhase("ready");
      setTimeLeft(0);
    } else {
      setIsActive(true);
    }
  };

  const getMessage = () => {
    if (!isActive) return "Press Start";
    if (phase === "inhale") return "Inhale";
    if (phase === "hold1") return "Hold";
    if (phase === "exhale") return "Exhale";
    if (phase === "hold2") return "Hold";
    return "";
  };

  // SVG path variants for drawing the box
  const pathVariants = {
    ready: { pathLength: 0, opacity: 0 },
    inhale: { pathLength: 0.25, opacity: 1, transition: { duration: 4, ease: "linear" } },
    hold1: { pathLength: 0.5, opacity: 1, transition: { duration: 4, ease: "linear" } },
    exhale: { pathLength: 0.75, opacity: 1, transition: { duration: 4, ease: "linear" } },
    hold2: { pathLength: 1, opacity: 1, transition: { duration: 4, ease: "linear" } },
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative w-64 h-64 flex items-center justify-center mb-12 bg-indigo-50 rounded-3xl">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          <motion.rect
            x="10"
            y="10"
            width="80"
            height="80"
            rx="8"
            fill="none"
            stroke="#e0e7ff"
            strokeWidth="4"
          />
          <motion.rect
            x="10"
            y="10"
            width="80"
            height="80"
            rx="8"
            fill="none"
            stroke="#6366f1"
            strokeWidth="4"
            variants={pathVariants}
            initial="ready"
            animate={phase}
            // Reset the path when it completes the full box
            onAnimationComplete={(definition) => {
              if (definition === "hold2") {
                // Instantly reset to 0 pathLength for the next inhale cycle
              }
            }}
          />
        </svg>

        <div className="z-10 flex flex-col items-center justify-center text-indigo-700">
          <AnimatePresence mode="wait">
            <motion.span
              key={phase}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="font-bold text-2xl uppercase tracking-wider"
            >
              {getMessage()}
            </motion.span>
          </AnimatePresence>
          {isActive && (
            <span className="text-4xl mt-2 font-black">{timeLeft}</span>
          )}
        </div>
      </div>

      <button
        onClick={toggleExercise}
        className={`flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg transition-all shadow-md ${
          isActive 
            ? "bg-red-50 text-red-600 hover:bg-red-100" 
            : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg"
        }`}
      >
        {isActive ? (
          <>
            <Square className="w-5 h-5 fill-current" /> Stop Exercise
          </>
        ) : (
          <>
            <Play className="w-5 h-5 fill-current" /> Start Box Breathing
          </>
        )}
      </button>

      <p className="mt-8 text-slate-500 text-center max-w-md font-medium">
        Inhale for 4s, hold for 4s, exhale for 4s, hold for 4s. Repeat to calm the nervous system.
      </p>
    </div>
  );
};

export default BoxBreathing;
