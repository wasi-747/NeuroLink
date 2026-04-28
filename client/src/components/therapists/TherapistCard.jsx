import React from "react";
import { Link } from "react-router-dom";
import { Star, MapPin, BadgeCheck, Languages } from "lucide-react";

const TherapistCard = ({ therapist }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-brand-200 transition-all group overflow-hidden flex flex-col h-full animate-in fade-in zoom-in-95 duration-500">
      
      {/* Top Banner & Avatar */}
      <div className="h-24 bg-gradient-to-r from-brand-100 to-indigo-50 relative">
        <div className="absolute -bottom-10 left-6">
          <img 
            src={therapist.photoUrl || `https://ui-avatars.com/api/?name=${therapist.userId?.name}&background=random`} 
            alt={therapist.userId?.name}
            className="w-20 h-20 rounded-2xl border-4 border-white shadow-sm object-cover bg-white"
          />
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          {therapist.isVerified && (
            <span className="bg-white/80 backdrop-blur-md text-brand-700 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm">
              <BadgeCheck className="w-3.5 h-3.5" /> Verified
            </span>
          )}
        </div>
      </div>

      <div className="pt-14 p-6 flex-1 flex flex-col">
        {/* Name & Title */}
        <div className="mb-4 flex justify-between items-start gap-4">
          <div>
            <h3 className="text-xl font-extrabold text-slate-800 group-hover:text-brand-600 transition-colors">
              {therapist.userId?.name || "Therapist"}
            </h3>
            <p className="text-brand-600 font-semibold text-sm">{therapist.title}</p>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-lg">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span className="text-sm font-bold">{therapist.rating?.toFixed(1) || "New"}</span>
            </div>
            <span className="text-xs text-slate-400 font-medium mt-1">({therapist.reviewCount} reviews)</span>
          </div>
        </div>

        {/* Info Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
            <MapPin className="w-3.5 h-3.5" /> {therapist.location}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
            <Languages className="w-3.5 h-3.5" /> {therapist.languages?.join(", ")}
          </div>
        </div>

        {/* Specializations */}
        <div className="flex flex-wrap gap-1.5 mb-6 flex-1">
          {therapist.specializations?.slice(0, 3).map(spec => (
            <span key={spec} className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
              {spec}
            </span>
          ))}
          {therapist.specializations?.length > 3 && (
            <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
              +{therapist.specializations.length - 3}
            </span>
          )}
        </div>

        {/* Footer: Price & CTA */}
        <div className="pt-4 border-t border-slate-50 flex items-center justify-between mt-auto">
          <div>
            <span className="text-sm font-medium text-slate-500">Session from</span>
            <div className="font-black text-slate-800">
              {therapist.currency} {therapist.sessionFee}
            </div>
          </div>
          <Link 
            to={`/therapists/${therapist._id}`}
            className="px-5 py-2.5 bg-brand-50 text-brand-700 hover:bg-brand-600 hover:text-white rounded-xl font-bold transition-all shadow-sm group-hover:shadow-md"
          >
            View Profile
          </Link>
        </div>

      </div>
    </div>
  );
};

export default TherapistCard;
