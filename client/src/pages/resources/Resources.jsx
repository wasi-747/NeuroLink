import React, { useState } from "react";
import ArticlesTab from "./ArticlesTab";
import ToolsTab from "./ToolsTab";
import EmergencyTab from "./EmergencyTab";
import OrganizationsTab from "./OrganizationsTab";
import { BookOpen, Activity, AlertTriangle, Building } from "lucide-react";

const Resources = () => {
  const [activeTab, setActiveTab] = useState("articles");

  const tabs = [
    { id: "articles", label: "Articles & Guides", icon: BookOpen },
    { id: "tools", label: "Stress Tools", icon: Activity },
    { id: "emergency", label: "Emergency Help", icon: AlertTriangle },
    { id: "organizations", label: "Organizations", icon: Building },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 md:p-12 mb-8 shadow-sm border border-slate-100 text-center relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Resources & Support
          </h1>
          <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto">
            Discover actionable guides, interactive stress-management tools, and direct lines to professional help.
          </p>
        </div>
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/4"></div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 sticky top-20 z-40">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all flex-1 min-w-[150px] justify-center text-sm md:text-base ${
                isActive
                  ? tab.id === "emergency" 
                    ? "bg-red-50 text-red-600 ring-1 ring-red-200 shadow-sm"
                    : "bg-brand-50 text-brand-700 ring-1 ring-brand-200 shadow-sm"
                  : "bg-transparent text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="animate-in slide-in-from-bottom-4 duration-300 fill-mode-both" key={activeTab}>
        {activeTab === "articles" && <ArticlesTab />}
        {activeTab === "tools" && <ToolsTab />}
        {activeTab === "emergency" && <EmergencyTab />}
        {activeTab === "organizations" && <OrganizationsTab />}
      </div>

    </div>
  );
};

export default Resources;
