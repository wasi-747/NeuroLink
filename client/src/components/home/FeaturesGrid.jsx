import React from "react";
import { motion } from "framer-motion";
import { Activity, ShieldCheck, Stethoscope, BookOpen, PhoneCall, LayoutDashboard } from "lucide-react";

const FeaturesGrid = () => {
  const features = [
    {
      title: "Mood Tracking",
      description: "Log your daily emotions and identify patterns over time with our intuitive tracker.",
      icon: Activity,
      color: "text-blue-500",
      bg: "bg-blue-100"
    },
    {
      title: "Anonymous Community",
      description: "Share your struggles and connect with peers safely without revealing your identity.",
      icon: ShieldCheck,
      color: "text-emerald-500",
      bg: "bg-emerald-100"
    },
    {
      title: "Expert Therapists",
      description: "Book secure teletherapy sessions with licensed professionals specializing in student issues.",
      icon: Stethoscope,
      color: "text-indigo-500",
      bg: "bg-indigo-100"
    },
    {
      title: "Mental Health Courses",
      description: "Access structured, self-paced masterclasses designed to build resilience and coping skills.",
      icon: BookOpen,
      color: "text-amber-500",
      bg: "bg-amber-100"
    },
    {
      title: "Emergency Help",
      description: "Immediate access to crisis hotlines and urgent support resources when you need them most.",
      icon: PhoneCall,
      color: "text-red-500",
      bg: "bg-red-100"
    },
    {
      title: "Progress Dashboard",
      description: "Visualize your wellness journey, journal entries, and habit streaks all in one place.",
      icon: LayoutDashboard,
      color: "text-purple-500",
      bg: "bg-purple-100"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-brand-600 font-bold tracking-wider uppercase text-sm mb-3">Comprehensive Support</h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Everything you need to thrive</h3>
          <p className="text-lg text-slate-500 font-medium">We've built a holistic ecosystem tailored specifically to the unique mental health challenges students face today.</p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div 
                key={idx} 
                variants={itemVariants}
                className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6`}>
                  <Icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h4 className="text-xl font-extrabold text-slate-900 mb-3">{feature.title}</h4>
                <p className="text-slate-500 font-medium leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default FeaturesGrid;
