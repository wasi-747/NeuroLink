import React, { useState, useEffect } from "react";
import { getTherapists } from "../../api/therapist";
import TherapistCard from "../../components/therapists/TherapistCard";
import {
  Loader2,
  Search,
  Filter,
  Stethoscope,
  ShieldCheck,
  Video,
  Sparkles,
  Calendar,
} from "lucide-react";
import { toast } from "react-hot-toast";

// Aligned with mobile TherapistsScreen.jsx
const SPECIALTIES = [
  "All",
  "Anxiety & Panic",
  "Depression Support",
  "Trauma & PTSD",
  "Burnout",
  "Relationship Stress",
  "Sleep Disorders",
  "Study-Based Counseling",
  "Career Stress",
];

const TherapistDirectory = () => {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All");
  const [sessionType, setSessionType] = useState("All");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");

  useEffect(() => {
    const fetchTherapists = async () => {
      setLoading(true);
      try {
        const filters = {
          search,
          location,
          sessionType,
          specializations:
            selectedSpecialty === "All" ? [] : [selectedSpecialty],
        };
        const res = await getTherapists(filters);
        setTherapists(res.data.data);
      } catch (err) {
        toast.error("Failed to load therapists.");
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchTherapists();
    }, 350);

    return () => clearTimeout(delayDebounceFn);
  }, [search, location, sessionType, selectedSpecialty]);

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-8 animate-in fade-in duration-400">
      {/* Hero Banner (Mobile Parity) */}
      <div className="card-lift p-6 md:p-10 bg-linear-to-br from-[#1e1b4b] via-[#3730a3] to-[#1e1b4b] text-white relative overflow-hidden shadow-lg border-none">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Stethoscope className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 md:w-3/4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-black uppercase tracking-wider px-3 py-1 bg-indigo-400/20 text-indigo-200 rounded-full inline-flex items-center gap-1.5 border border-indigo-400/30">
              <Stethoscope className="w-3.5 h-3.5 text-indigo-300" />
              LICENSED CLINICAL TELEHEALTH
            </span>
            <span className="text-xs font-bold text-indigo-200/80 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Confidential 1-on-1
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2 text-white">
            Certified Therapists & Telehealth 🩺
          </h1>
          <p className="text-indigo-100/90 text-sm md:text-base font-medium leading-relaxed mb-4 max-w-2xl">
            Connect with verified psychologists and campus counselors specializing in student burnout, academic panic, and emotional healing.
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-indigo-200">
            <span className="bg-indigo-950/60 px-3 py-1.5 rounded-xl border border-indigo-700/50 flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-brand-300" /> HD Secure Video Call
            </span>
            <span className="bg-indigo-950/60 px-3 py-1.5 rounded-xl border border-indigo-700/50 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand-300" /> Flexible Student Slots
            </span>
          </div>
        </div>
      </div>

      {/* Specialty Filter Pills (Mobile Parity) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {SPECIALTIES.map((spec) => {
          const isActive = selectedSpecialty === spec;
          return (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(spec)}
              className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-150 shrink-0 cursor-pointer ${
                isActive
                  ? "bg-brand text-white shadow-sm scale-105"
                  : "bg-white border-2 border-cream-dark text-muted hover:text-ink hover:border-slate-300"
              }`}
            >
              {spec}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="card-lift p-6 bg-white border-2 border-cream-dark sticky top-24 space-y-6">
            <h3 className="font-extrabold text-ink text-base flex items-center gap-2">
              <Filter className="w-4 h-4 text-brand" /> Filter Directory
            </h3>

            {/* Session Type */}
            <div>
              <label className="block text-xs font-extrabold text-ink uppercase tracking-wider mb-2">
                Session Mode
              </label>
              <div className="flex bg-cream/60 p-1 rounded-xl border border-cream-dark">
                {["All", "Online", "In-person"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSessionType(type)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      sessionType === type
                        ? "bg-white text-brand shadow-xs"
                        : "text-muted hover:text-ink"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-extrabold text-ink uppercase tracking-wider mb-2">
                Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input-field w-full text-xs font-bold"
              >
                <option value="All">Any Location (Worldwide)</option>
                <option value="Dhaka">Dhaka</option>
                <option value="Chittagong">Chittagong</option>
                <option value="Sylhet">Sylhet</option>
              </select>
            </div>

            {/* Active filters reset */}
            {(selectedSpecialty !== "All" ||
              sessionType !== "All" ||
              location !== "All" ||
              search.trim() !== "") && (
              <button
                onClick={() => {
                  setSelectedSpecialty("All");
                  setSessionType("All");
                  setLocation("All");
                  setSearch("");
                }}
                className="w-full py-2 rounded-xl text-xs font-bold text-coral hover:bg-coral/10 border border-coral/20 transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>

        {/* Main Feed */}
        <div className="flex-1 min-w-0 w-full space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-muted" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search therapist by name, qualification, or condition..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-cream-dark rounded-2xl focus:border-brand font-medium transition-all shadow-xs text-sm text-ink placeholder:text-muted/60 outline-none"
            />
          </div>

          {loading ? (
            <div className="card-lift p-16 flex flex-col items-center justify-center bg-white">
              <Loader2 className="w-8 h-8 animate-spin text-brand mb-3" />
              <p className="text-muted font-bold text-sm">
                Finding available counselors...
              </p>
            </div>
          ) : therapists.length === 0 ? (
            <div className="card-lift p-12 text-center bg-white">
              <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mx-auto mb-3 text-muted">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-ink mb-1">
                No therapists found
              </h3>
              <p className="text-xs text-muted max-w-sm mx-auto">
                We couldn't find anyone matching your current filters. Try relaxing the search or picking "All" specialties.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {therapists.map((therapist) => (
                <TherapistCard key={therapist._id} therapist={therapist} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TherapistDirectory;

