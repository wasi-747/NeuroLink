import React from "react";
import { Link } from "react-router-dom";

const EmergencyRibbon = () => {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-ink text-white px-4 py-3 text-center text-sm sm:text-base font-semibold flex items-center justify-center gap-2 z-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] animate-shimmer">
      <span className="text-white/70 text-xs font-bold">
        🆘 Need immediate help?
      </span>
      <Link
        to="/resources?tab=emergency"
        className="inline-flex items-center gap-1 text-coral hover:text-red-300 text-xs font-extrabold transition-colors ml-1"
      >
        Emergency Resources →
      </Link>
    </div>
  );
};

export default EmergencyRibbon;
