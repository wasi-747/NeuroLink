import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Menu,
  X,
  LogOut,
  User,
  ChevronDown,
  BookOpen,
  Users,
  Compass,
  Stethoscope,
  Calendar,
  PlayCircle,
  LayoutDashboard,
  ShieldAlert,
  Bell,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

// Dropdown Component
const DropdownMenu = ({ label, items, isActive }) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className={`flex flex-row items-center gap-1.5 focus:outline-none text-sm transition-colors ${
          isActive
            ? "text-brand font-bold"
            : "text-muted font-bold hover:text-ink"
        }`}
      >
        {label}
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full left-0 mt-2 min-w-50 bg-white border-2 border-cream-dark rounded-2xl shadow-lift z-50 origin-top-left overflow-hidden"
          >
            <div className="py-2 flex flex-col">
              {items.map((item, idx) => (
                <Link
                  key={idx}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-ink hover:bg-cream-dark transition-colors"
                >
                  {item.icon && <div className="text-brand">{item.icon}</div>}
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const UserDropdown = ({ user, isAdmin, handleLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <div
      className="relative ml-4 flex items-center gap-4"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center gap-2 bg-golden/20 text-golden font-bold text-xs px-3 py-1 rounded-full cursor-pointer hover:bg-golden/30 transition-colors">
        🌱 <span className="animate-pulse">0</span>
      </div>

      <button className="text-muted hover:text-ink transition-colors ml-2">
        <Bell className="w-5 h-5" />
      </button>
      <button className="flex items-center gap-2 group focus:outline-none">
        <div className="w-9 h-9 rounded-2xl bg-brand-light border-2 border-brand/20 flex items-center justify-center text-brand text-sm font-extrabold">
          {user?.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full right-0 mt-2 w-64 bg-white border-2 border-cream-dark rounded-2xl shadow-lift z-50 origin-top-right overflow-hidden"
          >
            <div className="p-4 border-b border-cream-dark bg-cream-dark/30">
              <p className="text-sm font-semibold text-ink">
                {user?.name || "Student"}
              </p>
              <p className="text-xs font-medium text-muted truncate">
                {user?.email || "Student Account"}
              </p>
            </div>
            <div className="py-2">
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-brand hover:bg-brand-light transition-colors"
                >
                  <ShieldAlert className="w-4 h-4" />
                  Admin Portal
                </Link>
              )}
              <Link
                to="/bookings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-ink hover:bg-cream-dark transition-colors"
              >
                <Calendar className="w-4 h-4 text-brand" />
                My Bookings
              </Link>
              <Link
                to="/my-courses"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-ink hover:bg-cream-dark transition-colors"
              >
                <PlayCircle className="w-4 h-4 text-brand" />
                My Courses
              </Link>
              <div className="h-px bg-cream-dark my-1"></div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-coral hover:bg-coral/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Navbar = () => {
  const { isAuthenticated, user, dispatch } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.get(
        `${import.meta.env.VITE_API_URL || "/api/v1"}/auth/logout`,
      );
    } catch (err) {
      console.error(err);
    }
    dispatch({ type: "LOGOUT" });
    navigate("/login");
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b-2 border-cream-dark sticky top-0 z-50 h-16">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center">
        <div className="flex justify-between w-full">
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <img
                src="/logo.png"
                alt="NeuroVerse"
                className="h-10 w-auto object-contain transition-opacity group-hover:opacity-80"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex sm:items-center sm:space-x-6">
            {isAuthenticated ? (
              <>
                <Link
                  to="/"
                  className="text-sm font-bold text-muted hover:text-ink transition-colors"
                >
                  Dashboard
                </Link>

                <DropdownMenu
                  label="Community & Help"
                  items={[
                    {
                      label: "Community Forum",
                      to: "/community",
                      icon: <Users className="w-4 h-4" />,
                    },
                    {
                      label: "Wellness Resources",
                      to: "/resources",
                      icon: <BookOpen className="w-4 h-4" />,
                    },
                  ]}
                />

                <DropdownMenu
                  label="Services"
                  items={[
                    {
                      label: "Find a Therapist",
                      to: "/therapists",
                      icon: <Stethoscope className="w-4 h-4" />,
                    },
                    {
                      label: "Explore Courses",
                      to: "/courses",
                      icon: <Compass className="w-4 h-4" />,
                    },
                  ]}
                />

                <UserDropdown
                  user={user}
                  isAdmin={user?.role === "admin"}
                  handleLogout={handleLogout}
                />
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-muted hover:text-ink font-bold px-3 py-2 transition-colors"
                >
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-2xl text-muted hover:text-ink hover:bg-cream-dark focus:outline-none transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
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
              className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-40 md:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col md:hidden border-l-2 border-cream-dark"
            >
              <div className="p-4 border-b border-cream-dark flex items-center justify-between">
                <span className="font-bold text-xl text-ink">Menu</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 -mr-2 text-muted hover:text-ink bg-cream-dark hover:bg-cream-dark/80 rounded-2xl transition-colors min-h-11 min-w-11 flex items-center justify-center"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4">
                {isAuthenticated ? (
                  <>
                    <div className="px-6 py-4 mb-2 bg-cream-dark border-y border-cream-dark/50 flex items-center gap-3 rounded-2xl mx-3">
                      <div className="bg-brand-light p-2.5 rounded-2xl">
                        <User className="h-6 w-6 text-brand" />
                      </div>
                      <div>
                        <div className="text-base font-bold text-ink">
                          {user?.name || "Student"}
                        </div>
                        <div className="text-sm font-medium text-muted">
                          {user?.email || "Student Account"}
                        </div>
                      </div>
                    </div>

                    <div className="px-3 space-y-1">
                      <Link
                        to="/"
                        className="block px-4 py-3 text-base font-medium text-ink hover:text-brand hover:bg-brand-light rounded-2xl transition-colors min-h-11"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/community"
                        className="block px-4 py-3 text-base font-medium text-ink hover:text-brand hover:bg-brand-light rounded-2xl transition-colors min-h-11"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Community Forum
                      </Link>
                      <Link
                        to="/resources"
                        className="block px-4 py-3 text-base font-medium text-ink hover:text-brand hover:bg-brand-light rounded-2xl transition-colors min-h-11"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Resources
                      </Link>
                      <Link
                        to="/therapists"
                        className="block px-4 py-3 text-base font-medium text-ink hover:text-brand hover:bg-brand-light rounded-2xl transition-colors min-h-11"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Find a Therapist
                      </Link>
                      <Link
                        to="/courses"
                        className="block px-4 py-3 text-base font-medium text-ink hover:text-brand hover:bg-brand-light rounded-2xl transition-colors min-h-11"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Courses
                      </Link>
                      <div className="my-2 border-t border-cream-dark" />
                      <Link
                        to="/bookings"
                        className="block px-4 py-3 text-base font-medium text-ink hover:text-brand hover:bg-brand-light rounded-2xl transition-colors min-h-11"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        My Bookings
                      </Link>
                      <Link
                        to="/my-courses"
                        className="block px-4 py-3 text-base font-medium text-ink hover:text-brand hover:bg-brand-light rounded-2xl transition-colors min-h-11"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        My Courses
                      </Link>

                      {user?.role === "admin" && (
                        <>
                          <div className="my-2 border-t border-cream-dark" />
                          <Link
                            to="/admin"
                            className="block px-4 py-3 text-base font-bold text-white bg-brand hover:bg-brand-dark rounded-2xl min-h-11"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Admin Portal
                          </Link>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="px-6 py-4 flex flex-col gap-4">
                    <Link
                      to="/login"
                      className="flex text-center w-full px-4 py-3 border-2 border-cream-dark rounded-2xl shadow-lift text-base font-bold text-ink bg-white hover:bg-cream-dark min-h-11 items-center justify-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign in
                    </Link>
                    <Link
                      to="/register"
                      className="btn-primary w-full! text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>

              {isAuthenticated && (
                <div className="p-4 border-t border-cream-dark">
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left flex items-center justify-center gap-2 px-4 py-3 text-base font-bold text-white bg-coral hover:bg-red-500 rounded-2xl transition-colors min-h-11"
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
