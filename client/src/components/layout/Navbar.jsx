import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { BrainCircuit, Menu, X, LogOut, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const Navbar = () => {
  const { isAuthenticated, user, dispatch } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:5000/api/v1/auth/logout");
    } catch (err) {
      console.error(err);
    }
    dispatch({ type: "LOGOUT" });
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-brand-100 p-2 rounded-xl group-hover:bg-brand-500 transition-colors">
                <BrainCircuit className="h-6 w-6 text-brand-600 group-hover:text-white transition-colors" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">NeuroLink</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            {isAuthenticated ? (
              <>
                <Link to="/" className="text-slate-600 hover:text-brand-600 font-medium px-3 py-2 rounded-md transition-colors">
                  Dashboard
                </Link>
                <Link to="/community" className="text-slate-600 hover:text-brand-600 font-medium px-3 py-2 rounded-md transition-colors">
                  Community
                </Link>
                <Link to="/resources" className="text-slate-600 hover:text-brand-600 font-medium px-3 py-2 rounded-md transition-colors">
                  Resources
                </Link>
                <Link to="/therapists" className="text-slate-600 hover:text-brand-600 font-medium px-3 py-2 rounded-md transition-colors">
                  Therapists
                </Link>
                <Link to="/courses" className="text-slate-600 hover:text-brand-600 font-medium px-3 py-2 rounded-md transition-colors">
                  Courses
                </Link>
                {user?.role === "admin" && (
                  <Link to="/admin" className="text-brand-600 hover:text-brand-700 font-bold px-3 py-2 rounded-md transition-colors bg-brand-50 border border-brand-100 shadow-sm">
                    Admin Portal
                  </Link>
                )}
                <div className="flex items-center gap-4 ml-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                    <User size={16} />
                    <span>{user?.name || "Student"}</span>
                  </div>
                  <Link to="/bookings" className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-full">
                    My Bookings
                  </Link>
                  <Link to="/my-courses" className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-full">
                    My Courses
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-slate-500 hover:text-red-600 transition-colors p-2 rounded-md hover:bg-red-50"
                  >
                    <LogOut size={18} />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-slate-600 hover:text-brand-600 font-medium px-3 py-2 transition-colors">
                  Sign in
                </Link>
                <Link to="/register" className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors blur-0">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500"
            >
              {isMobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col md:hidden"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-xl tracking-tight text-slate-900">Menu</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 -mr-2 text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4">
                {isAuthenticated ? (
                  <>
                    <div className="px-6 py-4 mb-2 bg-slate-50 border-y border-slate-100 flex items-center gap-3">
                      <div className="bg-brand-100 p-2.5 rounded-full">
                        <User className="h-6 w-6 text-brand-600" />
                      </div>
                      <div>
                        <div className="text-base font-bold text-slate-800">{user?.name || "Student"}</div>
                        <div className="text-sm font-medium text-slate-500">{user?.email || "Student Account"}</div>
                      </div>
                    </div>
                    
                    <div className="px-3 space-y-1">
                      <Link to="/" className="block px-4 py-3 text-base font-medium text-slate-700 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors min-h-[44px]" onClick={() => setIsMobileMenuOpen(false)}>
                        Dashboard
                      </Link>
                      <Link to="/community" className="block px-4 py-3 text-base font-medium text-slate-700 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors min-h-[44px]" onClick={() => setIsMobileMenuOpen(false)}>
                        Community Forum
                      </Link>
                      <Link to="/resources" className="block px-4 py-3 text-base font-medium text-slate-700 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors min-h-[44px]" onClick={() => setIsMobileMenuOpen(false)}>
                        Resources
                      </Link>
                      <Link to="/therapists" className="block px-4 py-3 text-base font-medium text-slate-700 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors min-h-[44px]" onClick={() => setIsMobileMenuOpen(false)}>
                        Find a Therapist
                      </Link>
                      <Link to="/courses" className="block px-4 py-3 text-base font-medium text-slate-700 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors min-h-[44px]" onClick={() => setIsMobileMenuOpen(false)}>
                        Courses
                      </Link>
                      <div className="my-2 border-t border-slate-100" />
                      <Link to="/bookings" className="block px-4 py-3 text-base font-medium text-slate-700 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors min-h-[44px]" onClick={() => setIsMobileMenuOpen(false)}>
                        My Bookings
                      </Link>
                      <Link to="/my-courses" className="block px-4 py-3 text-base font-medium text-slate-700 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors min-h-[44px]" onClick={() => setIsMobileMenuOpen(false)}>
                        My Courses
                      </Link>
                      
                      {user?.role === "admin" && (
                        <>
                          <div className="my-2 border-t border-slate-100" />
                          <Link to="/admin" className="block px-4 py-3 text-base font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl min-h-[44px]" onClick={() => setIsMobileMenuOpen(false)}>
                            Admin Portal
                          </Link>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="px-6 py-4 flex flex-col gap-4">
                    <Link to="/login" className="block text-center w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm text-base font-bold text-slate-700 bg-white hover:bg-slate-50 min-h-[44px] flex items-center justify-center" onClick={() => setIsMobileMenuOpen(false)}>
                      Sign in
                    </Link>
                    <Link to="/register" className="block text-center w-full px-4 py-3 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-brand-600 hover:bg-brand-700 min-h-[44px] flex items-center justify-center" onClick={() => setIsMobileMenuOpen(false)}>
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
              
              {isAuthenticated && (
                <div className="p-4 border-t border-slate-100">
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left flex items-center justify-center gap-2 px-4 py-3 text-base font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors min-h-[44px]"
                  >
                    <LogOut size={20} />
                    Logout
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
