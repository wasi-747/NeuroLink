import React, { useState } from "react";
import { Eye, Hand, Ear, Focus, Smile, CheckCircle } from "lucide-react";

const STEPS = [
  { id: 5, icon: Eye, title: "5 Things you can see", desc: "Look around you and name five things you can see right now." },
  { id: 4, icon: Hand, title: "4 Things you can feel", desc: "Pay attention to your body and name four things you can feel." },
  { id: 3, icon: Ear, title: "3 Things you can hear", desc: "Listen carefully. Name three sounds you can hear." },
  { id: 2, icon: Focus, title: "2 Things you can smell", desc: "Name two things you can smell right now (or your favorite smells)." },
  { id: 1, icon: Smile, title: "1 Good thing about yourself", desc: "Name one positive thing about yourself or your day." },
];

const Grounding = () => {
  const [completedSteps, setCompletedSteps] = useState([]);

  const toggleStep = (id) => {
    if (completedSteps.includes(id)) {
      setCompletedSteps(completedSteps.filter(s => s !== id));
    } else {
      setCompletedSteps([...completedSteps, id]);
    }
  };

  const isAllComplete = completedSteps.length === STEPS.length;

  return (
    <div className="max-w-2xl mx-auto py-8">
      
      {isAllComplete && (
        <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-2xl text-center animate-in zoom-in duration-300">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-green-800">You did great!</h3>
          <p className="text-green-700 font-medium mt-1">Hopefully you feel a bit more anchored to the present moment.</p>
          <button 
            onClick={() => setCompletedSteps([])}
            className="mt-4 px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg font-bold transition-colors"
          >
            Start Over
          </button>
        </div>
      )}

      <div className="space-y-4">
        {STEPS.map((step) => {
          const isCompleted = completedSteps.includes(step.id);
          const Icon = step.icon;
          
          return (
            <div 
              key={step.id}
              onClick={() => toggleStep(step.id)}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex gap-4 ${
                isCompleted 
                  ? "bg-slate-50 border-slate-200 opacity-60" 
                  : "bg-white border-indigo-100 hover:border-indigo-300 shadow-sm"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                isCompleted ? "bg-slate-200 text-slate-400" : "bg-indigo-100 text-indigo-600"
              }`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1 pt-1">
                <h3 className={`font-bold text-lg flex items-center gap-2 ${isCompleted ? "text-slate-500 line-through" : "text-slate-800"}`}>
                  <span className="text-xl">{step.id}.</span> {step.title}
                </h3>
                <p className={`font-medium mt-1 ${isCompleted ? "text-slate-400" : "text-slate-500"}`}>
                  {step.desc}
                </p>
              </div>
              <div className="shrink-0 flex items-center">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isCompleted ? "bg-green-500 border-green-500" : "border-slate-300"
                }`}>
                  {isCompleted && <CheckCircle className="w-5 h-5 text-white" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Grounding;
