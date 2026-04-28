import React, { useState, useEffect } from "react";
import { getTherapists } from "../../api/therapist";
import TherapistCard from "../../components/therapists/TherapistCard";
import { Loader2, Search, Filter, Stethoscope } from "lucide-react";
import { toast } from "react-hot-toast";

const SPECIALIZATIONS = [
  "Anxiety Therapy", "Depression Support", "Trauma & PTSD",
  "Study-Based Counseling", "Relationship Counseling", "Anger Management",
  "Grief Counseling", "Career Stress", "Sleep Disorders"
];

const TherapistDirectory = () => {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters State
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All");
  const [sessionType, setSessionType] = useState("All");
  const [selectedSpecs, setSelectedSpecs] = useState([]);

  useEffect(() => {
    const fetchTherapists = async () => {
      setLoading(true);
      try {
        const filters = { search, location, sessionType, specializations: selectedSpecs };
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
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search, location, sessionType, selectedSpecs]);

  const toggleSpec = (spec) => {
    setSelectedSpecs(prev => 
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    );
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-800 to-brand-800 rounded-3xl p-8 md:p-12 text-white mb-8 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Stethoscope className="w-64 h-64" />
        </div>
        <div className="relative z-10 md:w-2/3">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Find the Right Therapist
          </h1>
          <p className="text-brand-100 text-lg font-medium leading-relaxed mb-6">
            Connect with verified professionals who specialize in student mental health, academic stress, and personal wellbeing.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sticky top-24">
            <h3 className="font-extrabold text-slate-800 text-xl mb-6 flex items-center gap-2">
              <Filter className="w-5 h-5 text-brand-500" /> Filters
            </h3>

            {/* Session Type */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-3">Session Type</label>
              <div className="flex bg-slate-50 p-1 rounded-xl">
                {["All", "Online", "In-person"].map(type => (
                  <button
                    key={type}
                    onClick={() => setSessionType(type)}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                      sessionType === type ? "bg-white text-brand-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-3">Location</label>
              <select 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="All">Any Location</option>
                <option value="Dhaka">Dhaka</option>
                <option value="Chittagong">Chittagong</option>
                <option value="Sylhet">Sylhet</option>
              </select>
            </div>

            {/* Specializations */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3 flex justify-between items-center">
                Specializations
                {selectedSpecs.length > 0 && (
                  <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">{selectedSpecs.length}</span>
                )}
              </label>
              <div className="space-y-2">
                {SPECIALIZATIONS.map(spec => (
                  <label key={spec} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      selectedSpecs.includes(spec) ? "bg-brand-600 border-brand-600" : "bg-slate-50 border-slate-300 group-hover:border-brand-400"
                    }`}>
                      {selectedSpecs.includes(spec) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className={`text-sm font-medium ${selectedSpecs.includes(spec) ? "text-slate-900 font-bold" : "text-slate-600"}`}>
                      {spec}
                    </span>
                  </label>
                ))}
              </div>
              
              {selectedSpecs.length > 0 && (
                <button 
                  onClick={() => setSelectedSpecs([])}
                  className="mt-4 text-sm font-bold text-red-500 hover:text-red-600 w-full text-left"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Feed */}
        <div className="flex-1 min-w-0">
          
          {/* Search Bar */}
          <div className="mb-8 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-6 h-6 text-slate-400" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, condition, or keyword..."
              className="w-full pl-14 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium transition-all shadow-sm text-lg"
            />
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-brand-500 mb-4" />
              <p className="text-slate-500 font-medium">Finding therapists...</p>
            </div>
          ) : therapists.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No therapists found</h3>
              <p className="text-slate-500">We couldn't find anyone matching your specific filters. Try adjusting your search criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {therapists.map(therapist => (
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
