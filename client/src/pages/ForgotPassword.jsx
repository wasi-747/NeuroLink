import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BrainCircuit, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    
    // In a real app, this would call an API endpoint:
    // await api.post('/auth/forgot-password', { email });
    
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-slate-50 relative py-12 px-4">
      {/* Decorative Blobs */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
      
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl z-10 border border-slate-100 overflow-hidden relative backdrop-blur-sm bg-white/90 my-8">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-100 mb-4">
              <BrainCircuit className="w-8 h-8 text-brand-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Reset Password</h2>
            {!isSubmitted && (
              <p className="text-slate-500 mt-2 text-sm font-medium">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            )}
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 focus:ring-brand-500 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                    placeholder="name@student.edu"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 px-4 rounded-xl mt-6 transition-all shadow-md hover:shadow-lg flex justify-center items-center"
              >
                Send Reset Link
              </button>
            </form>
          ) : (
            <div className="text-center animate-in fade-in zoom-in duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Check your email</h3>
              <p className="text-slate-500 mb-8">
                We've sent a password reset link to <span className="font-semibold text-slate-700">{email}</span>.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-brand-600 font-semibold hover:text-brand-700"
              >
                Didn't receive the email? Try again
              </button>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link to="/login" className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
