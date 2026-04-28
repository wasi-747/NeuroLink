import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const CTABanner = () => {
  return (
    <div className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-brand-600 to-indigo-700 rounded-[3rem] p-10 md:p-16 text-center shadow-2xl shadow-brand-500/30 overflow-hidden relative"
        >
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">
              Ready to prioritize your mental health?
            </h2>
            <p className="text-lg md:text-xl text-brand-100 max-w-2xl mx-auto font-medium mb-10 leading-relaxed">
              Join thousands of students already on their wellness journey
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/register" 
                className="px-8 py-4 bg-white text-brand-700 hover:bg-slate-50 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:-translate-y-1"
              >
                Create Your Free Account <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CTABanner;
