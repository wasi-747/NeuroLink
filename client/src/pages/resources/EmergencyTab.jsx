import React from "react";
import { Phone, HeartHandshake, ShieldAlert } from "lucide-react";

const EmergencyTab = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="card-lift p-8 md:p-12 text-center border-2 border-coral/20 bg-coral/5">
        <div className="w-16 h-16 bg-coral/20 text-coral rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-ink mb-4">
          Are you in immediate danger?
        </h2>
        <p className="text-muted font-medium text-lg max-w-2xl mx-auto mb-8">
          If you or someone else is in immediate danger of self-harm or a
          medical emergency, please do not wait. Call your local emergency
          services immediately.
        </p>
        <div className="flex justify-center items-center gap-4">
          <a
            href="tel:999"
            className="btn-coral text-2xl px-12 py-4 flex items-center gap-3"
          >
            <Phone className="w-8 h-8 fill-current" /> Call 999
          </a>
        </div>
      </div>

      <h3 className="text-2xl font-extrabold text-ink pt-4">
        Mental Health Crisis Hotlines
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-lift p-6 group">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-coral/10 p-3 rounded-2xl text-coral">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-ink text-lg">Kaan Pete Roi</h4>
              <p className="text-muted text-sm font-medium">
                Emotional Support Helpline
              </p>
            </div>
          </div>
          <p className="text-muted text-sm mb-6 leading-relaxed">
            Kaan Pete Roi is an emotional support helpline in Bangladesh. Their
            trained volunteers are ready to listen to you.
          </p>
          <a
            href="tel:01779554391"
            className="block text-center w-full btn-coral"
          >
            Call 01779554391
          </a>
        </div>

        <div className="card-lift p-6 group">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-mint/10 p-3 rounded-2xl text-emerald-600">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-ink text-lg">Moner Bondhu</h4>
              <p className="text-muted text-sm font-medium">
                Psychosocial Support
              </p>
            </div>
          </div>
          <p className="text-muted text-sm mb-6 leading-relaxed">
            Providing accessible mental health and psychosocial support to youth
            and adults across the country.
          </p>
          <a
            href="tel:01776815252"
            className="block text-center w-full btn-mint"
          >
            Call 01776815252
          </a>
        </div>
      </div>
    </div>
  );
};

export default EmergencyTab;
