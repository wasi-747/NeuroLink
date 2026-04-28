import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { BrainCircuit, Mail, Lock, Loader2 } from "lucide-react";
import axios from "axios";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
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
      const response = await axios.post("http://localhost:5000/api/v1/auth/login", data);
      
      if (response.data.success) {
        dispatch({ type: "LOGIN_SUCCESS", payload: response.data.user });
        toast.success("Welcome back to NeuroLink!");
        navigate("/");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h2>
            <p className="text-slate-500 mt-2 text-sm font-medium">Sign in to continue your journey</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  {...register("email")}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 border ${errors.email ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-brand-500'} rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                  placeholder="name@student.edu"
                />
              </div>
              {errors.email && <p className="mt-2 text-sm text-red-500 font-medium">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  {...register("password")}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 border ${errors.password ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-brand-500'} rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="mt-2 text-sm text-red-500 font-medium">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 px-4 rounded-xl mt-6 transition-all shadow-md hover:shadow-lg disabled:opacity-70 flex justify-center items-center gap-2"
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

          <p className="mt-8 text-center text-sm font-medium text-slate-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-brand-600 hover:text-brand-700 font-semibold transition-colors">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
