import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { BrainCircuit, Lock, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import api from "../api/axios";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { dispatch } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.put(`/auth/reset-password/${token}`, { password });

      if (response.data.success) {
        dispatch({ type: "LOGIN_SUCCESS", payload: response.data.user });
        toast.success("Password updated successfully! Welcome back.");
        navigate("/");
      }
    } catch (err) {
      setError(
        err.response?.data?.error || "This reset link is invalid or has expired."
      );
      toast.error(
        err.response?.data?.error || "Reset failed. Please request a new link."
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
              Create New Password
            </h2>
            <p className="text-muted mt-2 text-sm font-semibold">
              Choose a strong password with at least 6 characters.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-ink mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border-2 border-cream-dark focus:border-brand rounded-2xl text-ink font-medium focus:outline-none transition-all placeholder:text-muted/60"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-ink mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border-2 border-cream-dark focus:border-brand rounded-2xl text-ink font-medium focus:outline-none transition-all placeholder:text-muted/60"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs font-bold text-coral text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3.5 text-base rounded-2xl mt-6 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating password...
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </form>

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

export default ResetPassword;
