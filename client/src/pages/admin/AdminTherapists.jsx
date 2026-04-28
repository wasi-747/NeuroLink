import React, { useState, useEffect } from "react";
import { getPendingTherapists, verifyTherapist } from "../../api/admin";
import { format, parseISO } from "date-fns";
import { toast } from "react-hot-toast";
import { Loader2, Stethoscope, CheckCircle, XCircle, MapPin, Briefcase, ExternalLink } from "lucide-react";

const AdminTherapists = () => {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTherapists();
  }, []);

  const fetchTherapists = async () => {
    try {
      const res = await getPendingTherapists();
      setTherapists(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch pending therapists");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    try {
      await verifyTherapist(id);
      toast.success("Therapist verified successfully");
      setTherapists(therapists.filter(t => t._id !== id));
    } catch (err) {
      toast.error("Failed to verify therapist");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40">
        <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <Stethoscope className="w-8 h-8 text-brand-500" /> Verification Queue
        </h1>
        <p className="text-slate-500 font-medium mt-1">Review and approve new professional therapist accounts.</p>
      </div>

      {therapists.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm">
          <CheckCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">No pending approvals</h3>
          <p className="text-slate-500 font-medium">All therapist accounts have been reviewed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {therapists.map(therapist => (
            <div key={therapist._id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 md:p-8 flex-1">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-brand-100 shrink-0 overflow-hidden">
                      <img src={therapist.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{therapist.userId?.name}</h3>
                      <p className="text-sm font-bold text-brand-600">{therapist.title}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider rounded-full shrink-0">
                    Pending
                  </span>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                    <Briefcase className="w-4 h-4 text-slate-400" /> 
                    {therapist.yearsOfExperience} years experience
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400" /> 
                    {therapist.location}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Bio Summary</h4>
                  <p className="text-sm font-medium text-slate-700 line-clamp-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {therapist.bio}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Specializations</h4>
                  <div className="flex flex-wrap gap-2">
                    {therapist.specializations.map((spec, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg border border-slate-200">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 border-t border-slate-100 flex flex-wrap gap-3">
                <button 
                  onClick={() => handleVerify(therapist._id)}
                  className="flex-1 min-w-[120px] py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <CheckCircle className="w-5 h-5" /> Approve Profile
                </button>
                <button 
                  className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <XCircle className="w-5 h-5" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminTherapists;
