import React from "react";
import { Link } from "react-router-dom";
import { PhoneCall, ArrowRight } from "lucide-react";

const EmergencyRibbon = () => {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-red-600 text-white px-4 py-3 text-center text-sm sm:text-base font-semibold flex items-center justify-center gap-2 z-[100] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
      <span>Need immediate help? &rarr;</span>
      <Link to="/resources#emergency" className="inline-flex items-center gap-1 text-red-100 hover:text-white underline underline-offset-2 transition-colors ml-1">
        Emergency Resources
      </Link>
    </div>
  );
};

export default EmergencyRibbon;
