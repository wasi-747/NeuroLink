import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { BrainCircuit, Mail, Lock, Loader2 } from "lucide-react";
import api from "../api/axios";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

const Login = () => {
  const { dispatch } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await api.post("/auth/login", data);

      if (response.data.success) {
        dispatch({ type: "LOGIN_SUCCESS", payload: response.data.user });
        toast.success("Welcome back to NeuroVerse!");
        navigate("/");
      }
    } catch (error) {
      if (!error.response || error.response.status === 502 || error.response.status === 503) {
        toast.error("Backend server is not running on port 5000. Please start the backend.");
      } else {
        toast.error(
          error.response?.data?.error || "Invalid credentials. Please try again.",
        );
      }
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
              Welcome Back
            </h2>
            <p className="text-muted mt-2 text-sm font-semibold">
              Sign in to continue your wellness journey 🌱
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-ink">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-brand hover:text-brand-dark transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted" />
                </div>
                <input
                  type="password"
                  {...register("password")}
                  className={`w-full pl-11 pr-4 py-3 bg-white border-2 ${
                    errors.password
                      ? "border-coral focus:border-coral"
                      : "border-cream-dark focus:border-brand"
                  } rounded-2xl text-ink font-medium focus:outline-none transition-all placeholder:text-muted/60`}
                  placeholder="••••••••"
                />
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
              className="w-full btn-primary py-3.5 text-base rounded-2xl mt-6 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Tip */}
          <div className="mt-6 p-3 bg-cream/60 border border-cream-dark rounded-xl text-center">
            <p className="text-xs font-bold text-ink/70">
              Demo Account: <span className="font-mono text-brand font-extrabold">student1@test.edu</span>
            </p>
            <p className="text-xs text-muted font-medium">
              Password: <span className="font-mono font-bold text-ink">password123</span>
            </p>
          </div>

          <p className="mt-6 text-center text-sm font-bold text-muted">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-brand hover:text-brand-dark font-extrabold transition-colors underline underline-offset-2"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
