import React from "react";
import { Link } from "react-router-dom";
import { BrainCircuit } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-ink text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div className="bg-brand-light p-2 rounded-xl group-hover:bg-brand transition-colors">
                <BrainCircuit className="h-6 w-6 text-brand group-hover:text-white transition-colors" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                NeuroVerse 🌱
              </span>
            </Link>
            <p className="text-white/60 text-sm mb-6 max-w-xs font-medium">
              You're not alone. We're with you every step. 💜
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 text-sm">Features</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/mood"
                  className="text-white/50 hover:text-white text-sm font-semibold transition-colors"
                >
                  AI Mood Prediction
                </Link>
              </li>
              <li>
                <Link
                  to="/community"
                  className="text-white/50 hover:text-white text-sm font-semibold transition-colors"
                >
                  Anonymous Forum
                </Link>
              </li>
              <li>
                <Link
                  to="/therapists"
                  className="text-white/50 hover:text-white text-sm font-semibold transition-colors"
                >
                  Professional Therapy
                </Link>
              </li>
              <li>
                <Link
                  to="/courses"
                  className="text-white/50 hover:text-white text-sm font-semibold transition-colors"
                >
                  Wellness Courses
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 text-sm">Support</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/resources"
                  className="text-white/50 hover:text-white text-sm font-semibold transition-colors"
                >
                  Resource Library
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="text-white/50 hover:text-white text-sm font-semibold transition-colors"
                >
                  Crisis Centers
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="text-white/50 hover:text-white text-sm font-semibold transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="text-white/50 hover:text-white text-sm font-semibold transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 text-sm">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="#"
                  className="text-white/50 hover:text-white text-sm font-semibold transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="text-white/50 hover:text-white text-sm font-semibold transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="text-white/50 hover:text-white text-sm font-semibold transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 text-center">
          <p className="text-white/30 text-xs font-bold">
            Made with 💜 for students everywhere
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
