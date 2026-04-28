import React, { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

const SCAN_STEPS = [
  { part: "Toes & Feet", action: "Curl your toes tightly, holding for 5 seconds. Now release and feel the tension melt away." },
  { part: "Calves", action: "Flex your feet upwards to tighten your calf muscles. Hold. Now release and relax." },
  { part: "Thighs", action: "Squeeze your thigh muscles tightly. Hold for a moment. Let go completely." },
  { part: "Stomach", action: "Draw your belly button in towards your spine. Hold it tight. Now let your stomach soften." },
  { part: "Shoulders", action: "Pull your shoulders up to your ears. Hold the tension. Drop them down completely." },
  { part: "Face", action: "Scrunch your face up tightly—eyes, mouth, nose. Hold. Now relax your jaw and let your face soften." },
];

const BodyScan = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  const nextStep = () => {
    if (currentStep < SCAN_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCompleted(true);
    }
  };

  const reset = () => {
    setCurrentStep(0);
    setCompleted(false);
  };

  if (completed) {
    return (
      <div className="text-center py-12 animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10" />
        </div>
        <h3 className="text-3xl font-extrabold text-slate-800 mb-4">Body Scan Complete</h3>
        <p className="text-slate-500 font-medium max-w-md mx-auto mb-8">
          You have successfully released the physical tension stored in your body. Notice how much lighter you feel.
        </p>
        <button 
          onClick={reset}
          className="px-8 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors shadow-sm"
        >
          Do it again
        </button>
      </div>
    );
  }

  const step = SCAN_STEPS[currentStep];

  return (
    <div className="max-w-2xl mx-auto py-8 text-center min-h-[300px] flex flex-col justify-center">
      
      {/* Progress Bar */}
      <div className="flex gap-2 mb-12 justify-center">
        {SCAN_STEPS.map((s, idx) => (
          <div 
            key={idx} 
            className={`h-2 w-12 rounded-full transition-colors duration-500 ${
              idx < currentStep ? "bg-teal-400" : idx === currentStep ? "bg-teal-600" : "bg-slate-200"
            }`}
          />
        ))}
      </div>

      <div key={currentStep} className="animate-in slide-in-from-right-8 fade-in duration-500">
        <h2 className="text-sm font-bold text-teal-600 uppercase tracking-widest mb-2">
          Focus on your
        </h2>
        <h3 className="text-4xl md:text-5xl font-black text-slate-800 mb-8">
          {step.part}
        </h3>
        <p className="text-lg md:text-xl text-slate-600 font-medium mb-12 leading-relaxed">
          {step.action}
        </p>
        
        <button 
          onClick={nextStep}
          className="inline-flex items-center gap-3 px-8 py-4 bg-teal-600 text-white rounded-2xl font-bold text-lg hover:bg-teal-700 hover:shadow-lg transition-all"
        >
          {currentStep === SCAN_STEPS.length - 1 ? "Finish Scan" : "Next Part"}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
};

export default BodyScan;
