import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Square } from "lucide-react";

const BreathingExercise = () => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState("ready"); // ready, inhale, hold, exhale
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
          setPhase("hold");
          setTimeLeft(7);
        } else if (phase === "hold") {
          setPhase("exhale");
          setTimeLeft(8);
        } else if (phase === "exhale") {
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

  const getScale = () => {
    if (!isActive || phase === "ready") return 1;
    if (phase === "inhale") return 1.5;
    if (phase === "hold") return 1.5;
    if (phase === "exhale") return 1;
    return 1;
  };

  const getDuration = () => {
    if (phase === "inhale") return 4;
    if (phase === "hold") return 7;
    if (phase === "exhale") return 8;
    return 1;
  };

  const getMessage = () => {
    if (!isActive) return "Press Start";
    if (phase === "inhale") return "Inhale Deeply";
    if (phase === "hold") return "Hold Your Breath";
    if (phase === "exhale") return "Exhale Slowly";
    return "";
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative w-64 h-64 flex items-center justify-center mb-12">
        <motion.div
          className="absolute inset-0 bg-blue-100 rounded-full"
          animate={{ scale: getScale() }}
          transition={{ duration: getDuration(), ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-8 bg-blue-200 rounded-full"
          animate={{ scale: getScale() }}
          transition={{ duration: getDuration(), ease: "easeInOut", delay: 0.1 }}
        />
        <div className="absolute inset-16 bg-blue-500 rounded-full shadow-lg flex items-center justify-center text-white font-bold text-2xl flex-col z-10">
          <AnimatePresence mode="wait">
            <motion.span
              key={phase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center text-lg px-2 leading-tight"
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
            : "bg-brand-600 text-white hover:bg-brand-700 hover:shadow-lg"
        }`}
      >
        {isActive ? (
          <>
            <Square className="w-5 h-5 fill-current" /> Stop Exercise
          </>
        ) : (
          <>
            <Play className="w-5 h-5 fill-current" /> Start 4-7-8 Breathing
          </>
        )}
      </button>

      <p className="mt-8 text-slate-500 text-center max-w-md font-medium">
        Breathe in through your nose for 4 seconds, hold your breath for 7 seconds, and exhale completely through your mouth for 8 seconds.
      </p>
    </div>
  );
};

export default BreathingExercise;
