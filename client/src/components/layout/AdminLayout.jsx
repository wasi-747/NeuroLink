import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  LayoutDashboard, 
  Users, 
  ShieldAlert, 
  Stethoscope, 
  BookOpen, 
  FileText, 
  LogOut,
  Menu,
  X,
  BrainCircuit
} from "lucide-react";
import axios from "axios";

const AdminLayout = () => {
  const { user, dispatch } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:5000/api/v1/auth/logout");
    } catch (err) {
      console.error(err);
    }
    dispatch({ type: "LOGOUT" });
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Moderation", path: "/admin/moderation", icon: ShieldAlert },
    { name: "Therapists", path: "/admin/therapists", icon: Stethoscope },
    { name: "Courses", path: "/admin/courses", icon: BookOpen },
    { name: "Articles", path: "/admin/articles", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        {/* Brand */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800 shrink-0">
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-brand-500/20 p-2 rounded-xl">
              <BrainCircuit className="h-6 w-6 text-brand-400" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-white block">NeuroLink</span>
              <span className="text-xs font-bold text-brand-400 uppercase tracking-widest">Admin Portal</span>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                  isActive 
                    ? "bg-brand-600 text-white shadow-md shadow-brand-900/20" 
                    : "hover:bg-slate-800 hover:text-white text-slate-400"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-brand-200" : "text-slate-500"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User / Logout */}
        <div className="p-4 border-t border-slate-800 shrink-0">
          <div className="bg-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 truncate pr-4">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white shrink-0">
                {user?.name?.charAt(0) || "A"}
              </div>
              <div className="truncate">
                <div className="text-sm font-bold text-white truncate">{user?.name}</div>
                <div className="text-xs font-medium text-slate-500 truncate">Administrator</div>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors shrink-0"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 lg:hidden bg-white border-b border-slate-200 flex items-center px-4 shrink-0">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-slate-900 ml-2">Admin Portal</span>
        </header>

        {/* Outlet Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-8">
          <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
