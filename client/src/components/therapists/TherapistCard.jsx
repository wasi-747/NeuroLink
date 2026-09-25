import React from "react";
import { Link } from "react-router-dom";
import { Star, MapPin, BadgeCheck, Languages, ArrowUpRight } from "lucide-react";

const TherapistCard = ({ therapist }) => {
  return (
    <div className="card-lift bg-white flex flex-col h-full overflow-hidden group">
      {/* Top Banner & Avatar */}
      <div className="h-24 bg-linear-to-r from-brand-light via-cream to-cream-dark/60 relative border-b-2 border-cream-dark">
        <div className="absolute -bottom-10 left-6">
          <img
            src={
              therapist.photoUrl ||
              `https://ui-avatars.com/api/?name=${therapist.userId?.name}&background=7c3aed&color=fff`
            }
            alt={therapist.userId?.name}
            className="w-20 h-20 rounded-2xl border-4 border-white shadow-md object-cover bg-white"
          />
        </div>
        <div className="absolute top-3.5 right-4 flex gap-2">
          {therapist.isVerified && (
            <span className="bg-white/90 backdrop-blur-xs text-brand px-2.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-xs border border-cream-dark">
              <BadgeCheck className="w-3.5 h-3.5 text-brand" /> Verified
            </span>
          )}
        </div>
      </div>

      <div className="pt-12 p-6 flex-1 flex flex-col">
        {/* Name & Title */}
        <div className="mb-3 flex justify-between items-start gap-4">
          <div>
            <h3 className="text-lg font-black text-ink group-hover:text-brand transition-colors">
              {therapist.userId?.name || "Therapist"}
            </h3>
            <p className="text-brand font-bold text-xs">{therapist.title}</p>
          </div>

          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 bg-amber-500/10 text-amber-700 px-2 py-0.5 rounded-lg border border-amber-500/20">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span className="text-xs font-black">
                {therapist.rating?.toFixed(1) || "New"}
              </span>
            </div>
            <span className="text-[10px] text-muted font-bold mt-0.5">
              ({therapist.reviewCount} reviews)
            </span>
          </div>
        </div>

        {/* Info Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted bg-cream/60 px-2.5 py-1 rounded-xl border border-cream-dark">
            <MapPin className="w-3 h-3 text-brand" /> {therapist.location}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted bg-cream/60 px-2.5 py-1 rounded-xl border border-cream-dark">
            <Languages className="w-3 h-3 text-brand" />{" "}
            {therapist.languages?.join(", ")}
          </div>
        </div>

        {/* Specializations */}
        <div className="flex flex-wrap gap-1.5 mb-5 flex-1">
          {therapist.specializations?.slice(0, 3).map((spec) => (
            <span
              key={spec}
              className="text-[11px] font-extrabold text-ink bg-cream/50 border border-cream-dark px-2.5 py-1 rounded-lg"
            >
              {spec}
            </span>
          ))}
          {therapist.specializations?.length > 3 && (
            <span className="text-[11px] font-bold text-muted bg-cream/30 px-2 py-1 rounded-lg border border-cream-dark">
              +{therapist.specializations.length - 3}
            </span>
          )}
        </div>

        {/* Footer: Price & CTA */}
        <div className="pt-3 border-t-2 border-cream-dark/60 flex items-center justify-between mt-auto">
          <div>
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">
              Student Fee
            </span>
            <div className="text-base font-black text-ink">
              {therapist.currency} {therapist.sessionFee}
            </div>
          </div>
          <Link
            to={`/therapists/${therapist._id}`}
            className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1 cursor-pointer"
          >
            <span>View Profile</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TherapistCard;

