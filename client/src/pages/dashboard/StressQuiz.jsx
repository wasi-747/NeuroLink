import React, { useState } from "react";
import { submitQuiz } from "../../api/stressQuiz";
import { toast } from "react-hot-toast";
import { Zap, ChevronRight, ChevronLeft, Loader2, RefreshCw, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const PSS_QUESTIONS = [
  { id: 1, text: "In the last month, how often have you been upset because of something that happened unexpectedly?", reverse: false },
  { id: 2, text: "In the last month, how often have you felt that you were unable to control the important things in your life?", reverse: false },
  { id: 3, text: "In the last month, how often have you felt nervous and 'stressed'?", reverse: false },
  { id: 4, text: "In the last month, how often have you felt confident about your ability to handle your personal problems?", reverse: true },
  { id: 5, text: "In the last month, how often have you felt that things were going your way?", reverse: true },
  { id: 6, text: "In the last month, how often have you found that you could not cope with all the things that you had to do?", reverse: false },
  { id: 7, text: "In the last month, how often have you been able to control irritations in your life?", reverse: true },
  { id: 8, text: "In the last month, how often have you felt that you were on top of things?", reverse: true },
  { id: 9, text: "In the last month, how often have you been angered because of things that were outside of your control?", reverse: false },
  { id: 10, text: "In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?", reverse: false },
];

const OPTIONS = [
  { value: 0, label: "Never", emoji: "😌" },
  { value: 1, label: "Almost Never", emoji: "🙂" },
  { value: 2, label: "Sometimes", emoji: "😐" },
  { value: 3, label: "Fairly Often", emoji: "😟" },
  { value: 4, label: "Very Often", emoji: "😖" },
];

const StressQuiz = () => {
  const [currentStep, setCurrentStep] = useState(0); // 0-9 for questions, 10 for results
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const handleOptionSelect = (value) => {
    setAnswers({ ...answers, [currentStep]: value });
    // Automatically proceed to next step after a brief delay for UX
    if (currentStep < 9) {
      setTimeout(() => setCurrentStep(prev => prev + 1), 350);
    }
  };

  const calculateTotalScore = () => {
    let total = 0;
    Object.keys(answers).forEach((stepIndex) => {
      const q = PSS_QUESTIONS[stepIndex];
      const val = answers[stepIndex];
      if (q.reverse) {
        // Reverse scoring: 0=4, 1=3, 2=2, 3=1, 4=0
        total += (4 - val);
      } else {
        total += val;
      }
    });
    return total;
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < 10) {
      toast.error("Please answer all questions.");
      return;
    }
    
    setIsSubmitting(true);
    const score = calculateTotalScore();
    const quizData = {
      score,
      answers: Object.values(answers)
    };

    try {
      const res = await submitQuiz(quizData);
      setResult(res.data.data);
      setCurrentStep(10);
      toast.success("Quiz completed successfully");
    } catch (err) {
      toast.error("Failed to submit quiz results");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getResultColor = (level) => {
    if (level === "Low") return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (level === "Moderate") return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-rose-600 bg-rose-50 border-rose-200";
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto h-[80vh] flex flex-col">
      <div className="mb-8 text-center shrink-0">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-100 mb-4">
          <Zap className="w-8 h-8 text-rose-600" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Stress Assessment</h1>
        <p className="text-slate-500">A quick 10-question check-in to measure your perceived stress levels over the last month.</p>
      </div>

      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col relative min-h-[450px]">
        
        {/* Progress Bar Header */}
        {currentStep < 10 && (
          <div className="bg-slate-50 p-6 border-b border-slate-100 shrink-0">
            <div className="flex justify-between text-sm font-bold text-slate-500 mb-3">
              <span>Question {currentStep + 1} of 10</span>
              <span>{Math.round(((currentStep) / 10) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-rose-500 h-full rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${((currentStep) / 10) * 100}%` }} 
              />
            </div>
          </div>
        )}

        {/* Question Area */}
        {currentStep < 10 ? (
          <div className="flex-1 p-6 md:p-10 flex flex-col">
            <h2 className="text-2xl font-bold text-slate-800 mb-8 leading-relaxed">
              {PSS_QUESTIONS[currentStep].text}
            </h2>

            <div className="flex flex-col gap-3 mt-auto">
              {OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleOptionSelect(opt.value)}
                  className={`w-full text-left p-4 rounded-xl border-2 font-medium flex items-center justify-between transition-all group ${
                    answers[currentStep] === opt.value
                      ? "border-rose-500 bg-rose-50 text-rose-800 shadow-sm"
                      : "border-slate-100 bg-white hover:border-rose-200 hover:bg-rose-50/50 text-slate-700"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-2xl opacity-80 group-hover:opacity-100 transition-opacity">{opt.emoji}</span>
                    <span className="text-lg">{opt.label}</span>
                  </span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    answers[currentStep] === opt.value ? "border-rose-500" : "border-slate-200"
                  }`}>
                    {answers[currentStep] === opt.value && <div className="w-3 h-3 rounded-full bg-rose-500" />}
                  </div>
                </button>
              ))}
            </div>

            {/* Navigation Footer */}
            <div className="mt-8 flex justify-between items-center pt-6 border-t border-slate-100">
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                disabled={currentStep === 0 || isSubmitting}
                className="px-6 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors flex items-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" /> Back
              </button>
              
              {currentStep === 9 ? (
                <button
                  onClick={handleSubmit}
                  disabled={answers[9] === undefined || isSubmitting}
                  className="px-8 py-3 rounded-xl font-bold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "See Results"}
                </button>
              ) : (
                <button
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  disabled={answers[currentStep] === undefined}
                  className="px-6 py-2.5 rounded-xl font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors flex items-center gap-2"
                >
                  Skip / Next <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Results Area */
          <div className="flex-1 p-6 md:p-10 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
            {result && (
              <>
                <h2 className="text-xl font-bold text-slate-500 uppercase tracking-widest mb-4">Your Results</h2>
                
                <div className={`w-40 h-40 rounded-full border-8 flex flex-col items-center justify-center mb-8 shadow-inner ${getResultColor(result.level)}`}>
                  <span className="text-5xl font-black">{result.score}</span>
                  <span className="text-sm font-bold opacity-70 mt-1">out of 40</span>
                </div>

                <div className={`px-6 py-2 rounded-full border-2 mb-8 ${getResultColor(result.level)}`}>
                  <span className="text-lg font-black tracking-wide uppercase">{result.level} Stress</span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 md:p-8 max-w-lg mb-8 border border-slate-100">
                  <p className="text-slate-700 font-medium leading-relaxed">
                    {result.suggestions || "Take time to explore our resources page for structured coping strategies and techniques."}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                  <button
                    onClick={() => {
                      setAnswers({});
                      setCurrentStep(0);
                      setResult(null);
                    }}
                    className="flex-1 px-6 py-3 rounded-xl font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-5 h-5" /> Retake Quiz
                  </button>
                  <Link
                    to="/resources"
                    className="flex-1 px-6 py-3 rounded-xl font-bold bg-brand-600 text-white hover:bg-brand-700 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                  >
                    View Resources <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StressQuiz;
