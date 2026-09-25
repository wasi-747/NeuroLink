import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import {
  BrainCircuit,
  Mail,
  Lock,
  User,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import api from "../api/axios";

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

const calculateStrength = (pass) => {
  let score = 0;
  if (!pass) return score;
  if (pass.length >= 6) score += 25;
  if (/[A-Z]/.test(pass)) score += 25;
  if (/[0-9]/.test(pass)) score += 25;
  if (/[^A-Za-z0-9]/.test(pass)) score += 25;
  return score;
};

const getStrengthDetails = (score) => {
  if (score === 0) return { color: "bg-slate-200", text: "None" };
  if (score <= 25) return { color: "bg-coral", text: "Weak" };
  if (score <= 50) return { color: "bg-golden", text: "Fair" };
  if (score <= 75) return { color: "bg-sky", text: "Good" };
  return { color: "bg-mint", text: "Strong" };
};

const Register = () => {
  const { dispatch } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await api.post("/auth/register", data);

      if (response.data.success) {
        dispatch({ type: "LOGIN_SUCCESS", payload: response.data.user });
        toast.success("Account created! Let's start tracking.");
        navigate("/");
      }
    } catch (error) {
      if (!error.response || error.response.status === 502 || error.response.status === 503) {
        toast.error("Backend server is not running on port 5000. Please start the backend.");
      } else {
        toast.error(
          error.response?.data?.error ||
            "Registration failed. Try a different email.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const strength = calculateStrength(passwordValue);
  const { color, text } = getStrengthDetails(strength);

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
              Create Account
            </h2>
            <p className="text-muted mt-2 text-sm font-semibold">
              Join NeuroVerse for free & start thriving 🌱
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-ink mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-muted" />
                </div>
                <input
                  type="text"
                  {...register("name")}
                  className={`w-full pl-11 pr-4 py-3 bg-white border-2 ${
                    errors.name
                      ? "border-coral focus:border-coral"
                      : "border-cream-dark focus:border-brand"
                  } rounded-2xl text-ink font-medium focus:outline-none transition-all placeholder:text-muted/60`}
                  placeholder="John Doe"
                />
              </div>
              {errors.name && (
                <p className="mt-2 text-xs text-coral font-bold">
                  {errors.name.message}
                </p>
              )}
            </div>

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
                  {...register("email")}
                  className={`w-full pl-11 pr-4 py-3 bg-white border-2 ${
                    errors.email
                      ? "border-coral focus:border-coral"
                      : "border-cream-dark focus:border-brand"
                  } rounded-2xl text-ink font-medium focus:outline-none transition-all placeholder:text-muted/60`}
                  placeholder="name@student.edu"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-xs text-coral font-bold">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-ink mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted" />
                </div>
                <input
                  type="password"
                  {...register("password")}
                  onChange={(e) => setPasswordValue(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 bg-white border-2 ${
                    errors.password
                      ? "border-coral focus:border-coral"
                      : "border-cream-dark focus:border-brand"
                  } rounded-2xl text-ink font-medium focus:outline-none transition-all placeholder:text-muted/60`}
                  placeholder="••••••••"
                />
              </div>

              {/* Password Strength Meter */}
              <div className="mt-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-muted">
                    Password strength:
                  </span>
                  <span
                    className={`text-xs font-extrabold ${text !== "None" ? color.replace("bg-", "text-") : "text-muted"}`}
                  >
                    {text}
                  </span>
                </div>
                <div className="w-full bg-cream-dark/50 rounded-full h-2 overflow-hidden flex">
                  <div
                    className={`h-full ${color} transition-all duration-300 rounded-full`}
                    style={{ width: `${Math.max(strength, 0)}%` }}
                  ></div>
                </div>
              </div>

              {errors.password && (
                <p className="mt-2 text-xs text-coral font-bold">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3.5 text-base rounded-2xl mt-4 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm font-bold text-muted">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-brand hover:text-brand-dark font-extrabold transition-colors underline underline-offset-2"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
