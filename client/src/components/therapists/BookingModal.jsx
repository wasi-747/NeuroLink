import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Calendar, Clock, Loader2, Video, Users } from "lucide-react";
import { createBooking } from "../../api/therapist";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const bookingSchema = z.object({
  service: z.string().min(1, "Please select a service"),
  sessionFormat: z.string().min(1, "Please select a format"),
  preferredDate: z.string().min(1, "Please select a date"),
  preferredTime: z.enum(["Morning", "Afternoon", "Evening"], { errorMap: () => ({ message: "Please select a time block" }) }),
  message: z.string().max(300, "Message must be under 300 characters").optional(),
});

const BookingModal = ({ isOpen, onClose, therapist }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bookingSchema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await createBooking(therapist._id, data);
      toast.success("Booking request sent successfully!");
      onClose();
      navigate("/"); // Redirect to dashboard where they can see bookings later
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Calculate min date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800">Request Appointment</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">with {therapist.userId?.name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Service Needed</label>
              <select
                {...register("service")}
                className={`w-full p-3 bg-slate-50 border ${errors.service ? "border-red-300 ring-1 ring-red-500" : "border-slate-200 focus:ring-2 focus:ring-brand-500"} rounded-xl text-slate-900 font-medium focus:outline-none transition-all`}
              >
                <option value="">Select service...</option>
                {therapist.services?.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.service && <p className="mt-2 text-sm text-red-500 font-medium">{errors.service.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Session Format</label>
              <select
                {...register("sessionFormat")}
                className={`w-full p-3 bg-slate-50 border ${errors.sessionFormat ? "border-red-300 ring-1 ring-red-500" : "border-slate-200 focus:ring-2 focus:ring-brand-500"} rounded-xl text-slate-900 font-medium focus:outline-none transition-all`}
              >
                <option value="">Select format...</option>
                {therapist.sessionTypes?.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.sessionFormat && <p className="mt-2 text-sm text-red-500 font-medium">{errors.sessionFormat.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Preferred Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type="date"
                  min={minDate}
                  {...register("preferredDate")}
                  className={`w-full pl-10 pr-3 p-3 bg-slate-50 border ${errors.preferredDate ? "border-red-300 ring-1 ring-red-500" : "border-slate-200 focus:ring-2 focus:ring-brand-500"} rounded-xl text-slate-900 font-medium focus:outline-none transition-all`}
                />
              </div>
              {errors.preferredDate && <p className="mt-2 text-sm text-red-500 font-medium">{errors.preferredDate.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Preferred Time</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="w-5 h-5 text-slate-400" />
                </div>
                <select
                  {...register("preferredTime")}
                  className={`w-full pl-10 pr-3 p-3 bg-slate-50 border ${errors.preferredTime ? "border-red-300 ring-1 ring-red-500" : "border-slate-200 focus:ring-2 focus:ring-brand-500"} rounded-xl text-slate-900 font-medium focus:outline-none transition-all`}
                >
                  <option value="">Select time...</option>
                  <option value="Morning">Morning (9am - 12pm)</option>
                  <option value="Afternoon">Afternoon (12pm - 4pm)</option>
                  <option value="Evening">Evening (4pm - 8pm)</option>
                </select>
              </div>
              {errors.preferredTime && <p className="mt-2 text-sm text-red-500 font-medium">{errors.preferredTime.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Message (Optional)</label>
            <textarea
              {...register("message")}
              rows={3}
              placeholder="Briefly describe what you'd like to discuss..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium transition-all resize-none"
            />
            {errors.message && <p className="mt-2 text-sm text-red-500 font-medium">{errors.message.message}</p>}
          </div>

          <div className="pt-4 flex justify-between items-center border-t border-slate-50">
            <div className="text-sm font-medium text-slate-500">
              Session Fee: <span className="font-bold text-slate-900">{therapist.currency} {therapist.sessionFee}</span>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl font-bold bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 transition-all shadow-sm flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                {isSubmitting ? "Sending Request..." : "Request Booking"}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};

export default BookingModal;
