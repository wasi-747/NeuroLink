import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  HeartHandshake,
  Phone,
  Copy,
  Check,
  Wind,
  UserCheck,
  X,
  ShieldAlert,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { toast } from "react-hot-toast";

const HELPLINES = [
  {
    name: "Kaan Pete Roi (Emotional Support & Suicide Prevention)",
    region: "Bangladesh (Toll-Free / Direct)",
    number: "+8801779554391",
    tel: "tel:+8801779554391",
    available: "3 PM – 3 AM Everyday",
    badge: "Recommended",
  },
  {
    name: "National Emergency & Safety Hotline",
    region: "Bangladesh",
    number: "999",
    tel: "tel:999",
    available: "24/7 Toll-Free",
    badge: "Emergency",
  },
  {
    name: "National Mental Health Institute Helpdesk",
    region: "Bangladesh",
    number: "16773",
    tel: "tel:16773",
    available: "24/7 Government Support",
    badge: "Clinical",
  },
  {
    name: "988 Suicide & Crisis Lifeline",
    region: "US & Canada (Call / Text)",
    number: "988",
    tel: "tel:988",
    available: "24/7 Toll-Free & Confidential",
    badge: "International",
  },
];

const CrisisModal = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const [copiedNumber, setCopiedNumber] = useState(null);
  const [showBreathingGuide, setShowBreathingGuide] = useState(false);
  const [breathPhase, setBreathPhase] = useState("Inhale");

  const handleClose = () => {
    setShowBreathingGuide(false);
    setIsOpen(false);
  };

  const handleCopy = (num) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    toast.success("Phone number copied to clipboard");
    setTimeout(() => setCopiedNumber(null), 2500);
  };

  const handleSeeTherapists = () => {
    handleClose();
    navigate("/therapists");
  };

  const startBreathing = () => {
    setShowBreathingGuide(true);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-ink/60 backdrop-blur-xs" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-3xl bg-white p-6 md:p-8 text-left align-middle shadow-2xl transition-all border-2 border-cream-dark">
                {/* Header Badge & Close Button */}
                <div className="flex items-center justify-between pb-4 border-b-2 border-cream-dark">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-coral/20 flex items-center justify-center text-coral">
                      <ShieldAlert className="w-5 h-5" />
                    </span>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-coral">
                        Care & Safety Check-In
                      </span>
                      <Dialog.Title
                        as="h3"
                        className="text-lg md:text-xl font-black text-ink leading-tight"
                      >
                        You Are Never Alone in This
                      </Dialog.Title>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-1.5 rounded-xl text-muted hover:text-ink hover:bg-cream-dark transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Supportive Message */}
                <div className="mt-4 p-4 rounded-2xl bg-cream/50 border border-cream-dark text-xs md:text-sm text-ink leading-relaxed font-medium">
                  We noticed your recent words may reflect heavy emotional distress. Please pause for a moment—your life and well-being have immense worth. Compassionate, confidential counselors are ready right now to listen without any judgment.
                </div>

                {/* Breathing Reset Shortcut */}
                {showBreathingGuide ? (
                  <div className="mt-5 p-5 bg-brand-light rounded-2xl border-2 border-brand/30 text-center animate-in fade-in">
                    <div className="flex items-center justify-center gap-2 text-brand font-black text-xs uppercase tracking-wider mb-2">
                      <Wind className="w-4 h-4 animate-bounce" />
                      <span>Gentle Grounding Exercise</span>
                    </div>
                    <div className="w-20 h-20 mx-auto rounded-full bg-brand text-white flex items-center justify-center text-xs font-black shadow-lg animate-pulse">
                      Breathe Slow
                    </div>
                    <p className="text-xs text-brand-dark font-bold mt-3">
                      Inhale through your nose for 4s • Hold for 4s • Exhale for 6s
                    </p>
                    <button
                      onClick={() => setShowBreathingGuide(false)}
                      className="mt-3 text-[11px] font-black text-muted hover:text-ink uppercase tracking-wider cursor-pointer"
                    >
                      Hide Breathing Guide
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 flex items-center justify-between p-3.5 bg-brand-light/60 rounded-2xl border border-brand/20">
                    <div className="flex items-center gap-2.5">
                      <Wind className="w-5 h-5 text-brand" />
                      <div>
                        <div className="text-xs font-black text-brand-dark">Feeling Overwhelmed?</div>
                        <div className="text-[11px] text-muted font-bold">Take a 60-second guided breathing reset</div>
                      </div>
                    </div>
                    <button
                      onClick={startBreathing}
                      className="px-3.5 py-1.5 bg-brand text-white rounded-xl text-xs font-black hover:bg-brand-dark transition-all cursor-pointer shadow-xs"
                    >
                      Breathe
                    </button>
                  </div>
                )}

                {/* Direct Helplines List */}
                <div className="mt-5 space-y-2.5">
                  <div className="text-[11px] font-black uppercase tracking-wider text-muted">
                    Immediate Confidential Helplines
                  </div>
                  {HELPLINES.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl border-2 border-cream-dark hover:border-brand/40 bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xs text-ink">{item.name}</span>
                          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-cream text-muted border border-cream-dark">
                            {item.badge}
                          </span>
                        </div>
                        <div className="text-[11px] text-muted font-semibold mt-0.5">
                          {item.region} • <span className="text-emerald-600 font-bold">{item.available}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={item.tel}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call {item.number}</span>
                        </a>
                        <button
                          onClick={() => handleCopy(item.number)}
                          title="Copy phone number"
                          className="p-2 border border-cream-dark rounded-xl text-muted hover:text-ink hover:bg-cream transition-all cursor-pointer"
                        >
                          {copiedNumber === item.number ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions Footer */}
                <div className="mt-6 pt-5 border-t-2 border-cream-dark flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleSeeTherapists}
                    className="w-full sm:w-auto px-4 py-2.5 bg-brand text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-brand-dark transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Connect with a Therapist</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full sm:w-auto px-4 py-2.5 border-2 border-cream-dark text-muted hover:text-ink hover:bg-cream rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer text-center"
                  >
                    I'm feeling safer now, thank you
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CrisisModal;
