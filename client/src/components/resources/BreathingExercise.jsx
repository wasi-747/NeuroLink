import React, { useState, useEffect } from "react";
import { Play, Square, RefreshCcw } from "lucide-react";

const BreathingExercise = () => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState("idle"); // idle, inhale, hold, exhale
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    let timer;
    if (isActive) {
      if (phase === "inhale") {
        timer = setTimeout(() => {
          setPhase("hold");
          setTimeLeft(7);
        }, 4000);
      } else if (phase === "hold") {
        timer = setTimeout(() => {
          setPhase("exhale");
          setTimeLeft(8);
        }, 7000);
      } else if (phase === "exhale") {
        timer = setTimeout(() => {
          setPhase("inhale");
          setTimeLeft(4);
        }, 8000);
      }
    }
    return () => clearTimeout(timer);
  }, [isActive, phase]);

  useEffect(() => {
    let countdown;
    if (isActive && timeLeft > 0) {
      countdown = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(countdown);
  }, [isActive, timeLeft]);

  const toggleExercise = () => {
    if (!isActive) {
      setIsActive(true);
      setPhase("inhale");
      setTimeLeft(4);
    } else {
      setIsActive(false);
      setPhase("idle");
      setTimeLeft(0);
    }
  };

  const getCircleClasses = () => {
    if (!isActive) return "scale-100 bg-slate-100";
    if (phase === "inhale") return "scale-150 bg-sky-200 transition-all duration-[4000ms] ease-out";
    if (phase === "hold") return "scale-150 bg-blue-300 transition-all duration-[7000ms] ease-linear";
    if (phase === "exhale") return "scale-100 bg-teal-200 transition-all duration-[8000ms] ease-in";
    return "scale-100 bg-slate-100";
  };

  const getMessage = () => {
    if (!isActive) return "Ready to relax?";
    if (phase === "inhale") return "Breathe In...";
    if (phase === "hold") return "Hold...";
    if (phase === "exhale") return "Breathe Out...";
  };

  return (
    <div className="flex flex-col items-center justify-center py-10">
      
      {/* Animated Circle Container */}
      <div className="relative w-64 h-64 flex items-center justify-center mb-16">
        <div className={`absolute w-40 h-40 rounded-full opacity-50 ${getCircleClasses()}`}></div>
        <div className={`absolute w-32 h-32 rounded-full opacity-80 ${getCircleClasses()}`} style={{ transitionDelay: '100ms' }}></div>
        <div className={`absolute w-24 h-24 rounded-full z-10 flex items-center justify-center shadow-lg text-2xl font-black text-slate-700 ${isActive ? 'bg-white' : 'bg-slate-200'}`}>
          {isActive ? timeLeft : ""}
        </div>
      </div>

      <h3 className="text-3xl font-extrabold text-slate-800 mb-2">{getMessage()}</h3>
      <p className="text-slate-500 font-medium mb-8">Follow the expanding and shrinking circle.</p>

      <button
        onClick={toggleExercise}
        className={`px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 transition-all ${
          isActive 
            ? "bg-slate-100 text-slate-700 hover:bg-slate-200" 
            : "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
        }`}
      >
        {isActive ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
        {isActive ? "Stop Exercise" : "Start Exercise"}
      </button>

    </div>
  );
};

export default BreathingExercise;
