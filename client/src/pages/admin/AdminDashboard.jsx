import React, { useState, useEffect } from "react";
import { getDashboardStats } from "../../api/admin";
import {
  Users,
  Activity,
  UserPlus,
  MessageSquare,
  Stethoscope,
  ShieldAlert,
  BookOpen,
  Loader2,
} from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getDashboardStats();
        setStats(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex justify-center items-center py-40">
        <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Active Today",
      value: stats.activeToday,
      icon: Activity,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      title: "New This Week",
      value: stats.newThisWeek,
      icon: UserPlus,
      color: "text-indigo-600",
      bg: "bg-indigo-100",
    },
    {
      title: "Forum Posts Today",
      value: stats.forumPostsToday,
      icon: MessageSquare,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      title: "Pending Therapists",
      value: stats.pendingTherapists,
      icon: Stethoscope,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      title: "Pending Reports",
      value: stats.pendingReports,
      icon: ShieldAlert,
      color: "text-red-600",
      bg: "bg-red-100",
    },
    {
      title: "Total Enrollments",
      value: stats.totalEnrollments,
      icon: BookOpen,
      color: "text-teal-600",
      bg: "bg-teal-100",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Platform Overview
        </h1>
        <p className="text-slate-500 font-medium mt-1">
          Monitor the pulse of the NeuroVerse ecosystem.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${stat.bg}`}
              >
                <Icon className={`w-7 h-7 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 mb-1">
                  {stat.title}
                </p>
                <h3 className="text-3xl font-black text-slate-900">
                  {stat.value.toLocaleString()}
                </h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Placeholder for future charts */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800">
              User Growth Chart
            </h3>
            <p className="text-slate-500 font-medium">
              Visualization coming soon
            </p>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800">
              Forum Activity Chart
            </h3>
            <p className="text-slate-500 font-medium">
              Visualization coming soon
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
