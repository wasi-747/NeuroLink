import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Square, CheckCircle } from "lucide-react";

const BodyScan = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { title: "Settle In", text: "Find a comfortable position and close your eyes. Take a deep breath." },
    { title: "Feet", text: "Focus your attention on your toes and feet. Notice any tension, and let it go." },
    { title: "Legs", text: "Move your focus up to your calves, knees, and thighs. Allow them to feel heavy and relaxed." },
    { title: "Hips & Core", text: "Notice your hips, lower back, and abdomen. Breathe into these areas to release tightness." },
    { title: "Chest & Back", text: "Feel your chest rise and fall. Release any tension between your shoulder blades." },
    { title: "Arms & Hands", text: "Let your shoulders drop. Relax your arms, wrists, and fingers completely." },
    { title: "Neck & Jaw", text: "Unclench your jaw. Let your tongue fall from the roof of your mouth. Relax your neck." },
    { title: "Head & Face", text: "Smooth your forehead. Relax your eyes. Feel a wave of calm over your entire body." },
    { title: "Complete", text: "You have completed the body scan. Take one last deep breath and open your eyes." }
  ];

  useEffect(() => {
    let timer;
    if (isActive && currentStep < steps.length - 1) {
      timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 8000); // Advance every 8 seconds
    } else if (currentStep === steps.length - 1) {
      setIsActive(false); // Stop when complete
    }
    return () => clearTimeout(timer);
  }, [isActive, currentStep, steps.length]);

  const toggleExercise = () => {
    if (isActive || currentStep === steps.length - 1) {
      setIsActive(false);
      setCurrentStep(0);
    } else {
      setIsActive(true);
    }
  };

  const progress = (currentStep / (steps.length - 1)) * 100;

  return (
    <div className="flex flex-col items-center justify-center py-8">
      
      <div className="w-full max-w-md bg-teal-50 rounded-3xl p-8 mb-12 shadow-sm border border-teal-100 relative overflow-hidden">
        
        {/* Progress Bar Background */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-teal-100">
          <motion.div 
            className="h-full bg-teal-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <div className="text-center min-h-[160px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-2xl font-bold text-teal-800 mb-4">{steps[currentStep].title}</h3>
              <p className="text-teal-900/80 text-lg leading-relaxed font-medium">
                {steps[currentStep].text}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <button
        onClick={toggleExercise}
        className={`flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg transition-all shadow-md ${
          isActive 
            ? "bg-red-50 text-red-600 hover:bg-red-100" 
            : currentStep === steps.length - 1 
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "bg-teal-600 text-white hover:bg-teal-700 hover:shadow-lg"
        }`}
      >
        {isActive ? (
          <>
            <Square className="w-5 h-5 fill-current" /> Stop Scan
          </>
        ) : currentStep === steps.length - 1 ? (
          <>
            <CheckCircle className="w-5 h-5" /> Restart Scan
          </>
        ) : (
          <>
            <Play className="w-5 h-5 fill-current" /> Start Body Scan
          </>
        )}
      </button>

      <p className="mt-8 text-slate-500 text-center max-w-md font-medium">
        This progressive muscle relaxation takes about 1 minute. Follow the prompts as they auto-advance.
      </p>
    </div>
  );
};

export default BodyScan;
