import React, { useState, useEffect } from "react";
import { getMyBookings } from "../../api/therapist";
import { format, parseISO } from "date-fns";
import { Calendar, Clock, Loader2, Video, MapPin, CheckCircle, Clock3, XCircle } from "lucide-react";
import { Link } from "react-router-dom";

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await getMyBookings();
        setBookings(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch(status) {
      case "Pending": return "bg-amber-100 text-amber-700 border-amber-200";
      case "Confirmed": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Declined": case "Cancelled": return "bg-red-100 text-red-700 border-red-200";
      case "Completed": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case "Pending": return <Clock3 className="w-4 h-4" />;
      case "Confirmed": return <CheckCircle className="w-4 h-4" />;
      case "Declined": case "Cancelled": return <XCircle className="w-4 h-4" />;
      case "Completed": return <CheckCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Appointments</h1>
        <p className="text-slate-500 font-medium mt-2">Manage your therapy and counseling sessions.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center">
          <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">No appointments yet</h3>
          <p className="text-slate-500 mb-6 font-medium">You haven't requested any therapy sessions.</p>
          <Link to="/therapists" className="px-6 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors">
            Find a Therapist
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map(booking => (
            <div key={booking._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow">
              
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${getStatusColor(booking.status)}`}>
                  {getStatusIcon(booking.status)} {booking.status}
                </span>
                <span className="text-slate-400 text-sm font-semibold">
                  {format(parseISO(booking.createdAt), "MMM d")}
                </span>
              </div>

              <div className="mb-6 flex-1">
                <h3 className="text-lg font-extrabold text-slate-900 mb-1">
                  {booking.service}
                </h3>
                <p className="text-brand-600 font-semibold text-sm mb-4">
                  with {booking.therapistId?.userId?.name || "Therapist"}
                </p>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    {format(parseISO(booking.preferredDate), "EEEE, MMMM do, yyyy")}
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                    <Clock className="w-5 h-5 text-slate-400" />
                    {booking.preferredTime}
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                    {booking.sessionFormat === "Online" ? <Video className="w-5 h-5 text-slate-400" /> : <MapPin className="w-5 h-5 text-slate-400" />}
                    {booking.sessionFormat}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50 mt-auto space-y-2">
                {booking.status === "Confirmed" && booking.sessionFormat === "Online" && booking.meetingLink && (
                  <Link to={`/room/${booking.meetingLink}`} className="block w-full py-2.5 bg-brand-600 text-white hover:bg-brand-700 text-center font-bold rounded-xl transition-colors shadow-sm flex justify-center items-center gap-2">
                    <Video className="w-4 h-4" /> Join Video Session
                  </Link>
                )}
                {booking.status === "Completed" ? (
                  <Link to={`/therapists/${booking.therapistId._id}`} className="block w-full py-2.5 bg-amber-50 text-amber-700 hover:bg-amber-100 text-center font-bold rounded-xl transition-colors">
                    Leave a Review
                  </Link>
                ) : (
                  <button className="block w-full py-2.5 bg-slate-50 text-slate-600 hover:bg-slate-100 text-center font-bold rounded-xl transition-colors" disabled>
                    Cancel Booking
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserBookings;
