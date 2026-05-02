import React, { useState } from "react";
import { Check, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

const Grounding = () => {
  const [items, setItems] = useState({
    sight: ["", "", "", "", ""],
    touch: ["", "", "", ""],
    sound: ["", "", ""],
    smell: ["", ""],
    taste: [""]
  });

  const categories = [
    { id: "sight", count: 5, label: "Things you can SEE", color: "indigo" },
    { id: "touch", count: 4, label: "Things you can TOUCH", color: "blue" },
    { id: "sound", count: 3, label: "Things you can HEAR", color: "emerald" },
    { id: "smell", count: 2, label: "Things you can SMELL", color: "amber" },
    { id: "taste", count: 1, label: "Thing you can TASTE", color: "rose" }
  ];

  const handleInput = (category, index, value) => {
    setItems(prev => ({
      ...prev,
      [category]: prev[category].map((item, i) => i === index ? value : item)
    }));
  };

  const isCategoryComplete = (category) => {
    return items[category].every(item => item.trim() !== "");
  };

  const isAllComplete = categories.every(cat => isCategoryComplete(cat.id));

  const resetExercise = () => {
    setItems({
      sight: ["", "", "", "", ""],
      touch: ["", "", "", ""],
      sound: ["", "", ""],
      smell: ["", ""],
      taste: [""]
    });
  };

  return (
    <div className="flex flex-col items-center py-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <p className="text-slate-500 font-medium text-lg">
            Look around your environment and type what you notice.
          </p>
        </div>

        <div className="space-y-6">
          {categories.map((cat, catIdx) => {
            const completed = isCategoryComplete(cat.id);
            return (
              <motion.div 
                key={cat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: catIdx * 0.1 }}
                className={`p-6 rounded-2xl border-2 transition-colors ${
                  completed 
                    ? `bg-${cat.color}-50 border-${cat.color}-200` 
                    : "bg-white border-slate-100 hover:border-slate-200"
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white bg-${cat.color}-500 shadow-sm`}>
                    {cat.count}
                  </div>
                  <h3 className={`text-xl font-bold text-${cat.color}-900`}>{cat.label}</h3>
                  {completed && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <Check className={`w-6 h-6 text-${cat.color}-500 ml-2`} />
                    </motion.div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {Array.from({ length: cat.count }).map((_, i) => (
                    <input
                      key={`${cat.id}-${i}`}
                      type="text"
                      placeholder={`Item ${i + 1}...`}
                      value={items[cat.id][i]}
                      onChange={(e) => handleInput(cat.id, i, e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none transition-all ${
                        completed
                          ? `border-${cat.color}-200 bg-${cat.color}-50 focus:ring-${cat.color}-400 text-${cat.color}-800`
                          : "border-slate-200 bg-slate-50 focus:ring-brand-400"
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {isAllComplete && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 p-6 bg-green-50 border border-green-200 rounded-2xl text-center"
          >
            <h3 className="text-2xl font-bold text-green-800 mb-2">Excellent Work</h3>
            <p className="text-green-700 font-medium mb-6">
              You've successfully anchored yourself in the present moment.
            </p>
            <button
              onClick={resetExercise}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors shadow-sm"
            >
              <RefreshCw className="w-5 h-5" /> Start Over
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Grounding;
