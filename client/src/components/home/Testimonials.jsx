import React from "react";
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "Sarah",
      role: "Dhaka University",
      quote: "NeuroLink's anonymous forum was a lifesaver during finals week. Knowing I wasn't the only one struggling with extreme anxiety completely changed my perspective.",
      stat: "Mood improved 40% in 2 weeks",
      avatar: "bg-blue-100 text-blue-700"
    },
    {
      id: 2,
      name: "Ahmed",
      role: "BRAC University",
      quote: "The teletherapy feature is incredibly seamless. I found a therapist who specifically understands the pressure of thesis deadlines. It's been transformative.",
      stat: "Anxiety reduced by 60%",
      avatar: "bg-emerald-100 text-emerald-700"
    },
    {
      id: 3,
      name: "Priya",
      role: "NSU",
      quote: "I use the daily mood tracker and journal every night. The 'Overcoming Anxiety' course gave me actual, practical tools I use every day before rounds.",
      stat: "Completed 3 wellness courses",
      avatar: "bg-purple-100 text-purple-700"
    }
  ];

  return (
    <div className="py-24 bg-slate-900 text-white overflow-hidden relative">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-brand-600/20 blur-[100px]" />
        <div className="absolute bottom-[10%] -right-[10%] w-[30%] h-[50%] rounded-full bg-indigo-600/20 blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className="text-brand-400 font-bold tracking-wider uppercase text-sm mb-3">Student Stories</h2>
          <h3 className="text-3xl md:text-4xl font-extrabold mb-4">You are not alone</h3>
          <p className="text-lg text-slate-400 font-medium">Hear from students who have found balance, resilience, and community through our platform.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <motion.div 
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-3xl p-8 relative hover:bg-slate-800 transition-colors"
            >
              <Quote className="absolute top-6 right-8 w-12 h-12 text-slate-700 opacity-50" />
              
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-slate-300 font-medium leading-relaxed mb-8 relative z-10 text-lg">
                "{testimonial.quote}"
              </p>

              <div className="flex items-center gap-4 mt-auto">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${testimonial.avatar}`}>
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-white">{testimonial.name}</h4>
                  <p className="text-xs font-bold text-brand-400 uppercase tracking-wider">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
