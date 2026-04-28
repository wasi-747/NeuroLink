import React from "react";
import { motion } from "framer-motion";
import { UserCheck, Activity, HeartHandshake } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      title: "Sign Up Anonymously",
      description: "Create an account using an alias. We don't require your real identity to access community features.",
      icon: UserCheck,
    },
    {
      id: 2,
      title: "Track & Connect",
      description: "Use daily trackers to monitor your mood and connect with peers in the anonymous forum.",
      icon: Activity,
    },
    {
      id: 3,
      title: "Get Professional Help",
      description: "When you're ready, book a secure video session with a verified therapist or enroll in a course.",
      icon: HeartHandshake,
    }
  ];

  return (
    <div className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className="text-brand-600 font-bold tracking-wider uppercase text-sm mb-3">Simple Process</h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">How NeuroLink Works</h3>
          <p className="text-lg text-slate-500 font-medium">Getting started on your mental wellness journey is easier than you think.</p>
        </motion.div>

        <div className="relative">
          {/* Desktop Connecting Line */}
          <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-1 bg-slate-100 rounded-full z-0">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.3 }}
              className="h-full bg-brand-500 rounded-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div 
                  key={step.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: idx * 0.2 }}
                  className="relative flex flex-col items-center text-center"
                >
                  <div className="w-24 h-24 rounded-full bg-white border-4 border-brand-500 flex items-center justify-center mb-6 shadow-xl shadow-brand-500/20">
                    <Icon className="w-10 h-10 text-brand-600" />
                  </div>
                  <div className="bg-brand-50 text-brand-600 font-black text-sm px-3 py-1 rounded-full mb-4 border border-brand-100">
                    Step {step.id}
                  </div>
                  <h4 className="text-xl font-extrabold text-slate-900 mb-3">{step.title}</h4>
                  <p className="text-slate-500 font-medium leading-relaxed max-w-xs">{step.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
