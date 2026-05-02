import React, { useState } from "react";
import BreathingExercise from "../../components/resources/BreathingExercise";
import BodyScan from "../../components/resources/BodyScan";
import Grounding from "../../components/resources/Grounding";
import BoxBreathing from "../../components/resources/BoxBreathing";
import { Wind, Activity, Eye, Square } from "lucide-react";

const ToolsTab = () => {
  const [activeTool, setActiveTool] = useState(null);

  const tools = [
    {
      id: "breathing",
      title: "4-7-8 Breathing",
      description: "A simple, highly effective rhythm for rapid relaxation.",
      icon: Wind,
      color: "from-sky-400 to-blue-500",
      bg: "bg-blue-50",
      component: <BreathingExercise />
    },
    {
      id: "box",
      title: "Box Breathing",
      description: "Equal-ratio breathing to regain focus and calm the nervous system.",
      icon: Square,
      color: "from-indigo-400 to-purple-500",
      bg: "bg-indigo-50",
      component: <BoxBreathing />
    },
    {
      id: "scan",
      title: "Progressive Body Scan",
      description: "Release physical tension step-by-step from head to toe.",
      icon: Activity,
      color: "from-emerald-400 to-teal-500",
      bg: "bg-teal-50",
      component: <BodyScan />
    },
    {
      id: "grounding",
      title: "5-4-3-2-1 Grounding",
      description: "Anchor yourself in the present during panic or high anxiety.",
      icon: Eye,
      color: "from-purple-400 to-indigo-500",
      bg: "bg-indigo-50",
      component: <Grounding />
    }
  ];

  if (activeTool) {
    const tool = tools.find(t => t.id === activeTool);
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-in zoom-in-95 duration-300">
        <div className={`p-4 md:p-6 bg-gradient-to-r ${tool.color} flex justify-between items-center text-white`}>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <tool.icon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{tool.title}</h2>
              <p className="text-white/80 text-sm font-medium hidden md:block">{tool.description}</p>
            </div>
          </div>
          <button 
            onClick={() => setActiveTool(null)}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-bold transition-colors text-sm"
          >
            Close Tool
          </button>
        </div>
        <div className="p-6 md:p-12">
          {tool.component}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {tools.map((tool, idx) => {
        const Icon = tool.icon;
        return (
          <div 
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm hover:shadow-md hover:border-brand-200 transition-all cursor-pointer group text-center flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
            style={{ animationDelay: `${idx * 150}ms` }}
          >
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
              <Icon className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-800 mb-3">{tool.title}</h3>
            <p className="text-slate-500 font-medium leading-relaxed">{tool.description}</p>
            
            <div className="mt-8 font-bold text-brand-600 group-hover:text-brand-700 flex items-center gap-2">
              Start Exercise <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ToolsTab;
