import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ArticlesTab from "./ArticlesTab";
import ToolsTab from "./ToolsTab";
import EmergencyTab from "./EmergencyTab";
import OrganizationsTab from "./OrganizationsTab";
import { BookOpen, Activity, AlertTriangle, Building } from "lucide-react";

const Resources = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("articles");

  const tabs = [
    { id: "articles", label: "Articles & Guides", icon: BookOpen },
    { id: "tools", label: "Stress Tools", icon: Activity },
    { id: "emergency", label: "Emergency Help", icon: AlertTriangle },
    { id: "organizations", label: "Organizations", icon: Building },
  ];

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");
    if (tabParam && tabs.find((t) => t.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="card-lift p-8 md:p-12 text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-ink mb-3">
          Resources & Support 🌱
        </h1>
        <p className="text-muted text-lg md:text-base font-semibold max-w-2xl mx-auto">
          Discover guides, interactive stress tools, and support. You've got
          this. 💜
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl shadow-lift border-2 border-cream-dark/50 sticky top-20 z-40">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all flex-1 min-w-37.5 justify-center text-sm md:text-base ${
                isActive
                  ? "bg-coral text-white shadow-btn-coral"
                  : "bg-white text-muted border-2 border-cream-dark/50 hover:bg-cream-dark"
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div
        className="animate-in slide-in-from-bottom-4 duration-300 fill-mode-both"
        key={activeTab}
      >
        {activeTab === "articles" && <ArticlesTab />}
        {activeTab === "tools" && <ToolsTab />}
        {activeTab === "emergency" && <EmergencyTab />}
        {activeTab === "organizations" && <OrganizationsTab />}
      </div>
    </div>
  );
};

export default Resources;
