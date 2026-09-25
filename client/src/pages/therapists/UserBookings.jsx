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
    <div className="max-w-5xl mx-auto pb-20 space-y-8 animate-in fade-in duration-400">
      <div className="card-lift p-6 md:p-8 bg-linear-to-r from-brand-50 via-white to-cream relative overflow-hidden">
        <h1 className="text-3xl font-black text-ink tracking-tight">
          My Telehealth Appointments 📅
        </h1>
        <p className="text-muted font-medium text-sm mt-1">
          Review, track, and join your scheduled confidential counseling sessions.
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="card-lift p-12 text-center bg-white border-2 border-cream-dark">
          <Calendar className="w-16 h-16 text-muted/60 mx-auto mb-3" />
          <h3 className="text-lg font-black text-ink mb-1">
            No appointments yet
          </h3>
          <p className="text-xs text-muted mb-6 font-medium max-w-sm mx-auto">
            You haven't requested any counseling sessions yet. Our campus psychologists are ready when you need support.
          </p>
          <Link
            to="/therapists"
            className="btn-primary text-xs py-2.5 px-5 inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Browse Therapists</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="card-lift bg-white border-2 border-cream-dark p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border flex items-center gap-1.5 ${getStatusColor(booking.status)}`}
                  >
                    {getStatusIcon(booking.status)} {booking.status}
                  </span>
                  <span className="text-muted text-xs font-bold">
                    {format(parseISO(booking.createdAt), "MMM d")}
                  </span>
                </div>

                <div className="mb-6">
                  <h3 className="text-base font-black text-ink mb-0.5">
                    {booking.service}
                  </h3>
                  <p className="text-brand font-bold text-xs mb-4">
                    with {booking.therapistId?.userId?.name || "Therapist"}
                  </p>

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5 text-ink text-xs font-semibold">
                      <Calendar className="w-4 h-4 text-brand" />
                      {format(
                        parseISO(booking.preferredDate),
                        "EEEE, MMMM do, yyyy",
                      )}
                    </div>
                    <div className="flex items-center gap-2.5 text-ink text-xs font-semibold">
                      <Clock className="w-4 h-4 text-brand" />
                      {booking.preferredTime}
                    </div>
                    <div className="flex items-center gap-2.5 text-muted text-xs font-semibold">
                      {booking.sessionFormat === "Online" ? (
                        <Video className="w-4 h-4 text-brand" />
                      ) : (
                        <MapPin className="w-4 h-4 text-brand" />
                      )}
                      {booking.sessionFormat} Session
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t-2 border-cream-dark/60 mt-auto space-y-2">
                {booking.status === "Confirmed" &&
                  booking.sessionFormat === "Online" &&
                  booking.meetingLink && (
                    <Link
                      to={`/room/${booking.meetingLink}`}
                      className="btn-primary w-full text-xs py-2 text-center flex justify-center items-center gap-1.5 cursor-pointer"
                    >
                      <Video className="w-4 h-4" /> Join Video Session
                    </Link>
                  )}
                {booking.status === "Completed" ? (
                  <Link
                    to={`/therapists/${booking.therapistId?._id}`}
                    className="block w-full py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 text-center font-bold text-xs rounded-xl transition-colors border border-amber-200"
                  >
                    Leave a Review
                  </Link>
                ) : booking.status !== "Confirmed" ? (
                  <span className="block text-center text-xs text-muted font-bold py-1">
                    Awaiting Counselor Confirmation
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserBookings;

