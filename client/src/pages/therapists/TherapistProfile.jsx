import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getTherapist } from "../../api/therapist";
import BookingModal from "../../components/therapists/BookingModal";
import { ArrowLeft, Star, MapPin, BadgeCheck, Languages, Clock, User as UserIcon } from "lucide-react";
import { toast } from "react-hot-toast";

const TherapistProfile = () => {
  const { id } = useParams();
  const [therapist, setTherapist] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getTherapist(id);
        setTherapist(res.data.data.therapist);
        setReviews(res.data.data.reviews);
      } catch (err) {
        toast.error("Failed to load therapist profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) {
    return <div className="text-center py-20 text-slate-500 font-medium animate-pulse">Loading profile...</div>;
  }

  if (!therapist) return null;

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-500">
      <Link to="/therapists" className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-600 font-semibold mb-6 transition-colors">
        <ArrowLeft className="w-5 h-5" /> Back to Directory
      </Link>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-8">
        
        {/* Banner */}
        <div className="h-48 bg-gradient-to-r from-brand-500 to-indigo-600 relative">
          <div className="absolute -bottom-16 left-8">
            <img 
              src={therapist.photoUrl || `https://ui-avatars.com/api/?name=${therapist.userId?.name}&background=random`} 
              alt={therapist.userId?.name}
              className="w-32 h-32 rounded-2xl border-4 border-white shadow-lg object-cover bg-white"
            />
          </div>
          <div className="absolute top-6 right-6">
            {therapist.isVerified && (
              <span className="bg-white/20 backdrop-blur-md text-white border border-white/40 px-3 py-1.5 rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-sm">
                <BadgeCheck className="w-4 h-4" /> Verified Professional
              </span>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-20 px-8 pb-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900 mb-1">{therapist.userId?.name}</h1>
              <p className="text-xl text-brand-600 font-semibold mb-4">{therapist.title}</p>
              
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                  <MapPin className="w-4 h-4 text-slate-400" /> {therapist.location}
                </div>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                  <Languages className="w-4 h-4 text-slate-400" /> {therapist.languages?.join(", ")}
                </div>
                <div className="flex items-center gap-1.5 text-sm font-bold text-amber-700 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" /> 
                  {therapist.rating?.toFixed(1) || "New"} ({therapist.reviewCount} reviews)
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 w-full md:w-auto shrink-0 text-center">
              <div className="text-sm font-medium text-slate-500 mb-1">Session Fee</div>
              <div className="text-3xl font-black text-slate-900 mb-4">{therapist.currency} {therapist.sessionFee}</div>
              <button 
                onClick={() => setIsBookingModalOpen(true)}
                className="w-full px-8 py-3 bg-brand-600 text-white hover:bg-brand-700 rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
              >
                Request Appointment
              </button>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100">
            <h3 className="text-xl font-extrabold text-slate-800 mb-4">About Me</h3>
            <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
              {therapist.bio}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div>
              <h3 className="text-lg font-extrabold text-slate-800 mb-4">Specializations</h3>
              <div className="flex flex-wrap gap-2">
                {therapist.specializations?.map(spec => (
                  <span key={spec} className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1.5 rounded-lg text-sm font-bold">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-800 mb-4">Available Services</h3>
              <ul className="space-y-2">
                {therapist.services?.map(service => (
                  <li key={service} className="flex items-center gap-2 text-slate-600 font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-400"></div> {service}
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
        <h3 className="text-2xl font-extrabold text-slate-800 mb-8">Client Feedback</h3>
        
        {reviews.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-500 font-medium">No reviews yet. Be the first to leave one after your session!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map(review => (
              <div key={review._id} className="pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-600">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{review.reviewerId?.name || "Anonymous Student"}</div>
                      <div className="text-xs text-slate-400 font-medium">{new Date(review.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-200"}`} />
                    ))}
                  </div>
                </div>
                <p className="text-slate-600 font-medium leading-relaxed ml-13">
                  "{review.content}"
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <BookingModal 
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        therapist={therapist}
      />
    </div>
  );
};

export default TherapistProfile;
