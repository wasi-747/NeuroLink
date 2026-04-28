import React from "react";
import { ExternalLink, Building, Users } from "lucide-react";

const ORGANIZATIONS = [
  {
    name: "Sajida Foundation",
    type: "NGO",
    focus: "Mental Health Advocacy & Support",
    website: "https://www.sajidafoundation.org",
    description: "Operates multiple psychological counseling centers and mental health advocacy programs.",
    iconColor: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    name: "Phree",
    type: "Platform",
    focus: "Anonymous Youth Support",
    website: "https://www.phree.com",
    description: "A platform focused on providing anonymous psychological support to teenagers and young adults.",
    iconColor: "text-purple-600",
    bgColor: "bg-purple-50"
  },
  {
    name: "Moner Daktar",
    type: "Clinical",
    focus: "Psychiatric Services",
    website: "https://www.monerdaktar.com",
    description: "Connecting patients with registered psychiatrists and therapists for severe mental health concerns.",
    iconColor: "text-emerald-600",
    bgColor: "bg-emerald-50"
  },
  {
    name: "Innovation for Wellbeing Foundation",
    type: "NGO",
    focus: "Policy & Community Wellbeing",
    website: "https://www.iwfbd.org",
    description: "Working to eliminate the stigma of mental illness through community-level interventions.",
    iconColor: "text-amber-600",
    bgColor: "bg-amber-50"
  }
];

const OrganizationsTab = () => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ORGANIZATIONS.map((org, idx) => (
          <div 
            key={org.name} 
            className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${org.bgColor} ${org.iconColor}`}>
                  {org.type === "NGO" ? <Building className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-lg">{org.name}</h3>
                  <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{org.type}</p>
                </div>
              </div>
            </div>
            
            <p className="text-slate-600 text-sm mb-6 leading-relaxed flex-1">
              {org.description}
            </p>
            
            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full">
                {org.focus}
              </span>
              <a 
                href={org.website} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors"
              >
                Visit Site <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrganizationsTab;
