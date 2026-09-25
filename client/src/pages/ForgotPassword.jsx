import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BrainCircuit, Mail, ArrowLeft, CheckCircle2, Loader2, ExternalLink } from "lucide-react";
import api from "../api/axios";
import { toast } from "react-hot-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const response = await api.post("/auth/forgot-password", { email });
      if (response.data.success) {
        setIsSubmitted(true);
        if (response.data.devResetUrl) {
          setDevResetUrl(response.data.devResetUrl);
        }
        toast.success("Password reset instructions sent!");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to send reset email. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center relative py-10 px-4">
      {/* Decorative Blobs */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-brand/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-coral/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 pointer-events-none" />

      <div className="max-w-md w-full card-lift overflow-hidden relative backdrop-blur-sm bg-white/95 my-6">
        <div className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-light mb-4 border border-brand/20 shadow-sm">
              <BrainCircuit className="w-8 h-8 text-brand" />
            </div>
            <h2 className="text-3xl font-extrabold text-ink tracking-tight">
              Reset Password
            </h2>
            {!isSubmitted && (
              <p className="text-muted mt-2 text-sm font-semibold">
                Enter your email address to receive password reset instructions.
              </p>
            )}
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-ink mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-muted" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border-2 border-cream-dark focus:border-brand rounded-2xl text-ink font-medium focus:outline-none transition-all placeholder:text-muted/60"
                    placeholder="name@student.edu"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-3.5 text-base rounded-2xl mt-6 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending link...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          ) : (
            <div className="text-center animate-in fade-in zoom-in duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-mint/20 mb-6 border border-mint/40">
                <CheckCircle2 className="w-8 h-8 text-mint" />
              </div>
              <h3 className="text-xl font-extrabold text-ink mb-2">
                Check your email
              </h3>
              <p className="text-muted text-sm font-medium mb-6">
                We've sent a password reset link to{" "}
                <span className="font-bold text-ink">{email}</span> via Resend.
              </p>

              {devResetUrl && (
                <div className="mb-6 p-3 bg-brand-light/60 border border-brand/20 rounded-2xl text-center">
                  <p className="text-xs font-bold text-ink/80 mb-1">Testing / Development Link:</p>
                  <a
                    href={devResetUrl}
                    className="inline-flex items-center gap-1 text-xs font-extrabold text-brand hover:text-brand-dark underline"
                  >
                    Click here to reset password directly <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              <button
                onClick={() => setIsSubmitted(false)}
                className="text-brand font-bold text-sm hover:text-brand-dark transition-colors underline underline-offset-2"
              >
                Didn't receive the email? Try again
              </button>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm font-bold text-muted hover:text-brand transition-colors"
            >
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
