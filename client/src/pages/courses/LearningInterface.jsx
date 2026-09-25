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
  Clock,
  Sparkles,
  BookOpen,
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

        const courseRes = await import("../../api/course").then((m) =>
          m.getCourse(id)
        );
        const courseData = courseRes.data.data;
        courseData.modules = res.data.fullModules;

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
        toast.success("Masterclass Completed! Official Certificate Unlocked!", {
          duration: 5000,
          icon: "🎉",
        });
      } else {
        confetti({ particleCount: 35, spread: 50, origin: { y: 0.8 } });
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
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
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
    const html = `
      <html>
        <head>
          <title>Certificate of Completion - ${course.title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Inter:wght@400;600&display=swap');
            body { margin: 0; padding: 20px; font-family: 'Inter', sans-serif; display: flex; justify-content: center; background: #fef3e8; }
            .cert-container { 
              border: 10px solid #2e1065; 
              padding: 40px; 
              width: 1000px; 
              height: 700px; 
              box-sizing: border-box; 
              text-align: center; 
              background: white; 
              position: relative;
            }
            .cert-border-inner { border: 2px solid #ddd6fe; height: 100%; box-sizing: border-box; padding: 50px; }
            .cert-logo { font-size: 24px; font-weight: 800; color: #7c3aed; margin-bottom: 30px; letter-spacing: 2px; }
            .cert-title { font-family: 'Cinzel', serif; font-size: 48px; color: #1e1b4b; margin-bottom: 8px; }
            .cert-subtitle { font-size: 16px; color: #64748b; margin-bottom: 35px; letter-spacing: 4px; text-transform: uppercase; }
            .cert-text { font-size: 18px; color: #475569; margin-bottom: 16px; }
            .cert-name { font-size: 38px; font-weight: bold; color: #1e1b4b; border-bottom: 2px solid #e2e8f0; display: inline-block; padding: 0 40px 10px; margin-bottom: 24px; }
            .cert-course { font-size: 26px; font-weight: 700; color: #7c3aed; margin-bottom: 40px; }
            .cert-footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; padding: 0 40px; }
            .cert-sig-line { width: 220px; border-top: 1px solid #94a3b8; padding-top: 10px; font-size: 13px; color: #64748b; }
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
              <div class="cert-logo">NEUROLINK WELLNESS ACADEMY</div>
              <div class="cert-title">CERTIFICATE OF COMPLETION</div>
              <div class="cert-subtitle">EVIDENCE-BASED PSYCHOEDUCATION</div>
              
              <div class="cert-text">This certifies that</div>
              <div class="cert-name">Valued Student</div>
              
              <div class="cert-text">has successfully completed all modules & clinical exercises in</div>
              <div class="cert-course">${course.title}</div>
              
              <div class="cert-footer">
                <div class="cert-sig-line">
                  <div class="cert-date">${new Date(
                    enrollment?.completedAt || Date.now()
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}</div>
                  Date Awarded
                </div>
                <div class="cert-sig-line" style="font-family: 'Cinzel', serif; font-size: 18px; color: #1e1b4b; padding-top: 0; border-top: none; border-bottom: 1px solid #94a3b8; padding-bottom: 5px; margin-bottom: 5px;">
                  ${course.instructor?.name || "Dr. Sarah Jenkins"}
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
      <div className="flex flex-col h-screen w-full justify-center items-center bg-[#1e1b4b] text-white space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-purple-300" />
        <p className="text-xs font-bold text-purple-200 uppercase tracking-wider">
          Initializing interactive classroom...
        </p>
      </div>
    );
  }

  const completedCount = enrollment.completedLessons?.length || 0;
  const progressPercent = Math.min(
    100,
    Math.round((completedCount / course.lessonCount) * 100)
  );
  const isCourseComplete = completedCount === course.lessonCount;

  return (
    <div className="flex h-screen bg-cream overflow-hidden animate-in fade-in">
      {/* Mobile Sidebar Toggle Button */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 p-2.5 bg-brand text-white rounded-2xl shadow-lg lg:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Curriculum Sidebar */}
      <div
        className={`fixed bottom-0 inset-x-0 z-40 w-full h-[65vh] bg-white border-t-2 border-cream-dark transform transition-transform duration-300 ease-in-out lg:inset-y-0 lg:left-0 lg:w-88 lg:h-full lg:border-t-0 lg:border-r-2 lg:relative flex flex-col ${
          sidebarOpen
            ? "translate-y-0 lg:translate-x-0"
            : "translate-y-full lg:-translate-x-full lg:translate-y-0"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 md:p-5 border-b-2 border-cream-dark flex items-start justify-between shrink-0 bg-cream/40">
          <div>
            <Link
              to={`/courses/${course._id}`}
              className="text-[11px] font-black uppercase tracking-wider text-muted hover:text-brand flex items-center gap-1 mb-1.5 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" /> Back to syllabus
            </Link>
            <h2 className="font-black text-sm md:text-base text-ink leading-snug line-clamp-2">
              {course.title}
            </h2>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 lg:hidden text-muted hover:text-ink cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar Header */}
        <div className="p-4 border-b-2 border-cream-dark shrink-0 bg-white">
          <div className="flex justify-between text-xs font-black uppercase tracking-wider mb-1.5">
            <span className="text-muted">Class Progress</span>
            <span className={isCourseComplete ? "text-emerald-600" : "text-brand"}>
              {progressPercent}%
            </span>
          </div>
          <div className="h-2 w-full bg-cream rounded-full overflow-hidden border border-cream-dark">
            <div
              className={`h-full transition-all duration-700 rounded-full ${
                isCourseComplete ? "bg-emerald-500" : "bg-brand"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-[11px] font-bold text-muted mt-1.5 flex justify-between">
            <span>
              {completedCount} of {course.lessonCount} completed
            </span>
            {isCourseComplete && (
              <span className="text-emerald-600 font-black flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Completed
              </span>
            )}
          </div>
        </div>

        {/* Lesson Navigation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {(course.modules || []).map((mod) => (
            <div key={mod._id} className="space-y-1">
              <h3 className="text-[11px] font-black text-muted uppercase tracking-wider px-2 pt-2">
                {mod.title}
              </h3>
              <div className="space-y-1">
                {(mod.lessons || []).map((lesson, idx) => {
                  const isCompleted = enrollment.completedLessons.includes(
                    lesson._id
                  );
                  const isCurrent = currentLesson?._id === lesson._id;

                  return (
                    <button
                      key={lesson._id}
                      onClick={() => {
                        setCurrentLesson(lesson);
                        if (window.innerWidth < 1024) setSidebarOpen(false);
                      }}
                      className={`w-full flex items-start gap-2.5 p-3 rounded-2xl transition-all text-left cursor-pointer border-2 ${
                        isCurrent
                          ? "bg-brand-light border-brand text-brand-dark shadow-xs"
                          : isCompleted
                          ? "bg-emerald-50/50 border-emerald-100 hover:border-emerald-200"
                          : "bg-white border-cream-dark/60 hover:border-cream-dark hover:bg-cream/20"
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isCompleted ? (
                          <div className="w-4.5 h-4.5 rounded-full bg-emerald-500 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white stroke-[3]" />
                          </div>
                        ) : lesson.type === "video" ? (
                          <PlayCircle
                            className={`w-4.5 h-4.5 ${
                              isCurrent ? "text-brand" : "text-muted"
                            }`}
                          />
                        ) : (
                          <FileText
                            className={`w-4.5 h-4.5 ${
                              isCurrent ? "text-brand" : "text-muted"
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-xs font-black line-clamp-2 leading-snug ${
                            isCurrent
                              ? "text-brand-dark"
                              : isCompleted
                              ? "text-emerald-900"
                              : "text-ink"
                          }`}
                        >
                          {idx + 1}. {lesson.title}
                        </div>
                        <div className="text-[10px] font-bold text-muted mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{lesson.duration}m</span>
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

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col h-full bg-white relative">
        <div className="flex-1 overflow-y-auto">
          {currentLesson ? (
            <div className="max-w-4xl mx-auto w-full h-full flex flex-col">
              {/* Media Player / Interactive Video Area */}
              <div className="w-full bg-black aspect-video relative shrink-0 shadow-inner">
                {currentLesson.type === "video" && currentLesson.videoUrl ? (
                  <iframe
                    src={currentLesson.videoUrl}
                    className="absolute inset-0 w-full h-full"
                    allowFullScreen
                    title={currentLesson.title}
                    frameBorder="0"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center p-8 bg-cream/40 overflow-y-auto">
                    <div className="max-w-xl text-ink font-medium leading-relaxed bg-white p-6 md:p-8 rounded-3xl border-2 border-cream-dark shadow-sm">
                      <div className="flex items-center gap-2 mb-3 text-brand font-black text-xs uppercase tracking-wider">
                        <FileText className="w-4 h-4" />
                        <span>Interactive Reading & Clinical Practice</span>
                      </div>
                      <div className="text-sm md:text-base text-ink space-y-4">
                        {currentLesson.content ||
                          "Reflect on this module and apply the grounding techniques in your personal daily log."}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Lesson Info & Bottom Action Bar */}
              <div className="p-6 md:p-10 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-xs font-black text-muted uppercase tracking-wider">
                    <Clock className="w-4 h-4 text-brand" />
                    <span>{currentLesson.duration} Minutes Duration</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black text-ink mb-3 leading-snug">
                    {currentLesson.title}
                  </h1>
                </div>

                {/* Bottom Action Bar */}
                <div className="mt-8 pt-6 border-t-2 border-cream-dark flex flex-col sm:flex-row items-center justify-between gap-4">
                  {isCourseComplete ? (
                    <button
                      onClick={generateCertificate}
                      className="w-full sm:w-auto px-6 py-3.5 bg-amber-400 text-amber-950 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md hover:bg-amber-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Award className="w-4 h-4 text-amber-900" />
                      <span>Print Official Certificate</span>
                    </button>
                  ) : (
                    <div className="text-xs font-extrabold text-muted hidden sm:flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-brand" /> Complete every lesson to earn your diploma
                    </div>
                  )}

                  {!enrollment.completedLessons.includes(currentLesson._id) ? (
                    <button
                      onClick={handleCompleteLesson}
                      className="w-full sm:w-auto px-6 py-3.5 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Mark Lesson Complete</span>
                    </button>
                  ) : (
                    <div className="w-full sm:w-auto px-6 py-3.5 bg-emerald-50 text-emerald-700 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-emerald-200">
                      <CheckCircle className="w-4 h-4" />
                      <span>Lesson Completed</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-muted font-bold text-sm">
              Select a lesson from the curriculum sidebar to begin
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningInterface;
