import React from "react";
import CountUpModule from "react-countup";
const CountUp = CountUpModule.default || CountUpModule;
import { motion } from "framer-motion";

const StatsBar = () => {
  const stats = [
    { label: "Students Helped", value: 10000, suffix: "+", prefix: "" },
    { label: "Resources", value: 500, suffix: "+", prefix: "" },
    { label: "Therapists", value: 50, suffix: "+", prefix: "" },
    { label: "Anonymous", value: 100, suffix: "%", prefix: "" }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 -mt-16 md:-mt-24 mb-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-x-0 md:divide-x divide-slate-100">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center px-4">
              <div className="text-4xl md:text-5xl font-black text-slate-900 mb-2">
                {stat.prefix}
                <CountUp 
                  end={stat.value} 
                  duration={2.5} 
                  separator="," 
                  enableScrollSpy 
                  scrollSpyOnce
                />
                {stat.suffix}
              </div>
              <div className="text-sm md:text-base font-bold text-slate-500 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default StatsBar;
