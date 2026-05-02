import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getEnrollmentStatus, completeLesson } from "../../api/course";
import confetti from "canvas-confetti";
import { toast } from "react-hot-toast";
import {
  Loader2,
  ArrowLeft,
  PlayCircle,
  FileText,
  CheckCircle,
  Award,
  Check,
  Menu,
  X,
} from "lucide-react";

const LearningInterface = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchEnrollment = async () => {
      try {
        const res = await getEnrollmentStatus(id);
        if (!res.data.isEnrolled) {
          toast.error("You are not enrolled in this course");
          navigate(`/courses/${id}`);
          return;
        }

        setEnrollment(res.data.enrollment);

        // We get fullModules from the status endpoint to have the videos
        // But we need the course title etc. So we should fetch course details too if fullModules doesn't have it.
        // Actually, getEnrollmentStatus can just return the full course object. Let's assume it doesn't and we fetch getCourse.
        const courseRes = await import("../../api/course").then((m) =>
          m.getCourse(id),
        );
        const courseData = courseRes.data.data;
        courseData.modules = res.data.fullModules; // Inject full modules

        setCourse(courseData);

        // Auto-select first uncompleted lesson, or first lesson overall
        const completedIds = res.data.enrollment.completedLessons || [];
        let nextLesson = null;

        for (const mod of courseData.modules) {
          for (const les of mod.lessons) {
            if (!completedIds.includes(les._id) && !nextLesson) {
              nextLesson = les;
            }
          }
        }

        setCurrentLesson(nextLesson || courseData.modules[0].lessons[0]);

        // On mobile, close sidebar by default
        if (window.innerWidth < 1024) setSidebarOpen(false);
      } catch (err) {
        toast.error("Error loading course environment");
        navigate("/courses");
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollment();
  }, [id, navigate]);

  const handleCompleteLesson = async () => {
    if (!currentLesson || !enrollment) return;

    // Prevent re-completing
    if (enrollment.completedLessons.includes(currentLesson._id)) {
      goToNextLesson();
      return;
    }

    try {
      const res = await completeLesson(course._id, currentLesson._id);
      setEnrollment(res.data.data);

      const newCompletedCount = res.data.data.completedLessons.length;
      if (newCompletedCount === course.lessonCount) {
        triggerConfetti();
        toast.success("Congratulations! You've completed the course!", {
          duration: 5000,
          icon: "🎉",
        });
      } else {
        toast.success("Lesson completed!");
        goToNextLesson();
      }
    } catch (err) {
      toast.error("Failed to mark complete");
    }
  };

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        }),
      );
      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        }),
      );
    }, 250);
  };

  const goToNextLesson = () => {
    let foundCurrent = false;
    for (const mod of course.modules) {
      for (const les of mod.lessons) {
        if (foundCurrent) {
          setCurrentLesson(les);
          return;
        }
        if (les._id === currentLesson._id) {
          foundCurrent = true;
        }
      }
    }
  };

  const generateCertificate = () => {
    // Generate an elegant HTML certificate that opens in a new tab and prompts to print
    const html = `
      <html>
        <head>
          <title>Certificate of Completion</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Inter:wght@400;600&display=swap');
            body { margin: 0; padding: 20px; font-family: 'Inter', sans-serif; display: flex; justify-content: center; background: #f8fafc; }
            .cert-container { 
              border: 10px solid #1e293b; 
              padding: 40px; 
              width: 1000px; 
              height: 700px; 
              box-sizing: border-box; 
              text-align: center; 
              background: white; 
              position: relative;
            }
            .cert-border-inner { border: 2px solid #cbd5e1; height: 100%; box-sizing: border-box; padding: 50px; }
            .cert-logo { font-size: 24px; font-weight: 800; color: #4f46e5; margin-bottom: 40px; letter-spacing: 2px; }
            .cert-title { font-family: 'Cinzel', serif; font-size: 52px; color: #0f172a; margin-bottom: 10px; }
            .cert-subtitle { font-size: 18px; color: #64748b; margin-bottom: 40px; letter-spacing: 4px; text-transform: uppercase; }
            .cert-text { font-size: 20px; color: #475569; margin-bottom: 20px; }
            .cert-name { font-size: 42px; font-weight: bold; color: #0f172a; border-bottom: 2px solid #e2e8f0; display: inline-block; padding: 0 40px 10px; margin-bottom: 30px; }
            .cert-course { font-size: 28px; font-weight: 600; color: #4f46e5; margin-bottom: 50px; }
            .cert-footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 50px; padding: 0 50px; }
            .cert-sig-line { width: 200px; border-top: 1px solid #94a3b8; padding-top: 10px; font-size: 14px; color: #64748b; }
            .cert-date { font-weight: 600; color: #0f172a; }
            @media print {
              body { background: white; padding: 0; }
              .cert-container { width: 100%; height: 100%; border-width: 5px; }
            }
          </style>
        </head>
        <body onload="window.print()">
          <div class="cert-container">
            <div class="cert-border-inner">
              <div class="cert-logo">NEUROVERSE WELLNESS</div>
              <div class="cert-title">CERTIFICATE</div>
              <div class="cert-subtitle">of Completion</div>
              
              <div class="cert-text">This is proudly presented to</div>
              <div class="cert-name">Awesome Student</div>
              
              <div class="cert-text">for successfully completing the masterclass</div>
              <div class="cert-course">${course.title}</div>
              
              <div class="cert-footer">
                <div class="cert-sig-line">
                  <div class="cert-date">${new Date(enrollment.completedAt || Date.now()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
                  Date of Completion
                </div>
                <div class="cert-sig-line" style="font-family: 'Cinzel', serif; font-size: 20px; color: #0f172a; padding-top: 0; border-top: none; border-bottom: 1px solid #94a3b8; padding-bottom: 5px; margin-bottom: 5px;">
                  Dr. Sarah Jenkins
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  if (loading || !course || !enrollment) {
    return (
      <div className="flex h-screen w-full justify-center items-center bg-slate-900">
        <Loader2 className="w-12 h-12 animate-spin text-brand-500" />
      </div>
    );
  }

  const completedCount = enrollment.completedLessons?.length || 0;
  const progressPercent = Math.round(
    (completedCount / course.lessonCount) * 100,
  );
  const isCourseComplete = completedCount === course.lessonCount;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden animate-in fade-in">
      {/* Mobile Sidebar Overlay */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-xl shadow-lg lg:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* Sidebar (Bottom drawer on mobile, Left sidebar on desktop) */}
      <div
        className={`fixed bottom-0 inset-x-0 z-40 w-full h-[60vh] bg-white border-t border-slate-200 transform transition-transform duration-300 ease-in-out lg:inset-y-0 lg:left-0 lg:w-80 lg:h-full lg:border-t-0 lg:border-r lg:relative flex flex-col ${sidebarOpen ? "translate-y-0 lg:translate-x-0" : "translate-y-full lg:-translate-x-full lg:translate-y-0"}`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-100 flex items-start justify-between shrink-0 bg-slate-50">
          <div>
            <Link
              to={`/courses/${course._id}`}
              className="text-xs font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1 mb-2"
            >
              <ArrowLeft className="w-3 h-3" /> Back to course details
            </Link>
            <h2 className="font-extrabold text-slate-900 leading-tight line-clamp-2">
              {course.title}
            </h2>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 lg:hidden text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="p-4 border-b border-slate-100 shrink-0">
          <div className="flex justify-between text-xs font-bold mb-2">
            <span className="text-slate-500">Your Progress</span>
            <span
              className={
                isCourseComplete ? "text-emerald-500" : "text-brand-600"
              }
            >
              {progressPercent}%
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${isCourseComplete ? "bg-emerald-500" : "bg-brand-500"}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-xs font-medium text-slate-400 mt-2">
            {completedCount} of {course.lessonCount} lessons completed
          </div>
        </div>

        {/* Lesson List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {course.modules.map((mod) => (
            <div key={mod._id}>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 pl-2">
                {mod.title}
              </h3>
              <div className="space-y-1">
                {mod.lessons.map((lesson, idx) => {
                  const isCompleted = enrollment.completedLessons.includes(
                    lesson._id,
                  );
                  const isCurrent = currentLesson?._id === lesson._id;

                  return (
                    <button
                      key={lesson._id}
                      onClick={() => {
                        setCurrentLesson(lesson);
                        if (window.innerWidth < 1024) setSidebarOpen(false);
                      }}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left ${
                        isCurrent
                          ? "bg-brand-50 border border-brand-100"
                          : "hover:bg-slate-50 border border-transparent"
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isCompleted ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white stroke-[3]" />
                          </div>
                        ) : lesson.type === "video" ? (
                          <PlayCircle
                            className={`w-5 h-5 ${isCurrent ? "text-brand-500" : "text-slate-300"}`}
                          />
                        ) : (
                          <FileText
                            className={`w-5 h-5 ${isCurrent ? "text-brand-500" : "text-slate-300"}`}
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <div
                          className={`text-sm font-semibold line-clamp-2 ${isCurrent ? "text-brand-900" : isCompleted ? "text-slate-600" : "text-slate-700"}`}
                        >
                          {idx + 1}. {lesson.title}
                        </div>
                        <div
                          className={`text-xs mt-1 ${isCurrent ? "text-brand-500 font-medium" : "text-slate-400 font-medium"}`}
                        >
                          {lesson.duration} min
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full bg-white relative">
        {/* Header Spacer for mobile */}
        {!sidebarOpen && <div className="h-16 lg:hidden bg-slate-900 w-full" />}

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto">
          {currentLesson ? (
            <div className="max-w-4xl mx-auto w-full h-full flex flex-col">
              {/* Media Player / Reader */}
              <div className="w-full bg-black aspect-video relative flex-shrink-0">
                {currentLesson.type === "video" && currentLesson.videoUrl ? (
                  <iframe
                    src={currentLesson.videoUrl}
                    className="absolute inset-0 w-full h-full"
                    allowFullScreen
                    title={currentLesson.title}
                    frameBorder="0"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center p-8 bg-slate-50">
                    <div className="prose prose-slate max-w-none text-slate-700 font-medium leading-relaxed">
                      {currentLesson.content ||
                        "Read the attached material here."}
                    </div>
                  </div>
                )}
              </div>

              {/* Lesson Details */}
              <div className="p-8 md:p-12 flex-1">
                <h1 className="text-3xl font-extrabold text-slate-900 mb-4">
                  {currentLesson.title}
                </h1>
                <p className="text-slate-500 font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" /> {currentLesson.duration} minutes
                </p>

                {/* Bottom Action Bar */}
                <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  {isCourseComplete ? (
                    <button
                      onClick={generateCertificate}
                      className="w-full sm:w-auto px-8 py-4 bg-amber-400 text-amber-900 rounded-xl font-black shadow-lg hover:bg-amber-300 transition-colors flex items-center justify-center gap-2"
                    >
                      <Award className="w-5 h-5" /> Download Certificate
                    </button>
                  ) : (
                    <div className="text-sm font-bold text-slate-400 hidden sm:block">
                      Keep going!
                    </div>
                  )}

                  {!enrollment.completedLessons.includes(currentLesson._id) ? (
                    <button
                      onClick={handleCompleteLesson}
                      className="w-full sm:w-auto px-8 py-4 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <CheckCircle className="w-5 h-5" /> Mark as Complete
                    </button>
                  ) : (
                    <div className="w-full sm:w-auto px-8 py-4 bg-emerald-50 text-emerald-600 rounded-xl font-bold flex items-center justify-center gap-2 border border-emerald-100">
                      <CheckCircle className="w-5 h-5" /> Completed
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400 font-medium">
              Select a lesson to begin
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningInterface;
