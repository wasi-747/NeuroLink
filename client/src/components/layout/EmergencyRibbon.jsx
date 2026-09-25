import React from "react";
import { Link } from "react-router-dom";

const EmergencyRibbon = () => {
  return (
    <div className="w-full bg-ink text-white px-4 py-2 text-center text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 z-40 border-b border-white/10">
      <span className="text-white/80 font-bold">
        🆘 Need immediate help?
      </span>
      <Link
        to="/resources?tab=emergency"
        className="inline-flex items-center gap-1 text-coral hover:text-red-300 font-extrabold transition-colors ml-1 underline underline-offset-2"
      >
        Emergency Resources →
      </Link>
    </div>
  );
};

export default EmergencyRibbon;
