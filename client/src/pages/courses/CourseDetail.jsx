import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getCourse, enrollCourse } from "../../api/course";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import {
  Loader2,
  PlayCircle,
  FileText,
  CheckCircle,
  Clock,
  Star,
  Users,
  ArrowLeft,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  BookOpen,
  GraduationCap,
  Sparkles,
  Award,
  Check,
} from "lucide-react";
import confetti from "canvas-confetti";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState([0]); // First module open by default

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await getCourse(id);
        setCourse(res.data.data);

        // Also check enrollment status if user is logged in
        if (user) {
          const { getEnrollmentStatus } = await import("../../api/course");
          const statusRes = await getEnrollmentStatus(id);
          setIsEnrolled(statusRes.data.isEnrolled);
          if (statusRes.data.isEnrolled && statusRes.data.fullModules) {
            setCourse((prev) => ({
              ...prev,
              modules: statusRes.data.fullModules,
            }));
          }
        }
      } catch (err) {
        toast.error("Failed to load course details");
        navigate("/courses");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id, navigate, user]);

  const toggleModule = (index) => {
    if (expandedModules.includes(index)) {
      setExpandedModules(expandedModules.filter((i) => i !== index));
    } else {
      setExpandedModules([...expandedModules, index]);
    }
  };

  const handleEnrollClick = () => {
    if (!user) {
      toast.error("Please login to enroll");
      navigate("/login");
      return;
    }
    if (course.price > 0) {
      setShowPaymentModal(true);
    } else {
      processEnrollment();
    }
  };

  const processEnrollment = async (e) => {
    if (e) e.preventDefault();
    setEnrolling(true);

    // Simulate payment delay if paid
    if (course.price > 0) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    try {
      await enrollCourse(course._id);
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      toast.success(`Successfully enrolled in ${course.title}!`);
      setShowPaymentModal(false);
      setIsEnrolled(true);
      navigate(`/courses/${course._id}/learn`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to enroll");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-40 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-brand" />
        <p className="text-xs font-bold text-muted uppercase tracking-wider">
          Preparing syllabus & modules...
        </p>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="min-h-screen pb-20 animate-in fade-in duration-300">
      {/* Hero Section */}
      <div className="bg-linear-to-br from-[#3b0764] via-[#581c87] to-[#1e1b4b] text-white pt-8 pb-20 px-4 md:px-8 relative overflow-hidden rounded-3xl shadow-lg border-2 border-purple-900/30">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <GraduationCap className="w-80 h-80 text-white" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 text-purple-200 hover:text-white font-extrabold text-xs uppercase tracking-wider mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Masterclasses
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-5">
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 bg-purple-400/20 text-purple-200 font-black text-[11px] uppercase tracking-wider rounded-full border border-purple-400/30 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {course.category}
                </span>
                <span className="px-3 py-1 bg-white/10 text-white font-black text-[11px] uppercase tracking-wider rounded-full border border-white/20">
                  {course.level}
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight text-white">
                {course.title}
              </h1>

              <p className="text-sm md:text-base text-purple-100/90 font-medium leading-relaxed max-w-2xl">
                {course.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-bold text-purple-200">
                <div className="flex items-center gap-2 text-amber-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-white font-black text-sm">{course.rating || "4.9"}</span>
                  <span className="text-purple-300">({course.enrollmentCount || 0} students)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-purple-300" /> {course.duration} Hours Total
                </div>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-purple-300" /> {course.lessonCount} Lessons
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-purple-800/40">
                <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-black text-base text-white">
                  {course.instructor?.name?.charAt(0) || "D"}
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-purple-300">Lead Clinician</div>
                  <div className="font-extrabold text-white text-sm">{course.instructor?.name || "Dr. Sarah Jenkins"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Content (Left) */}
          <div className="lg:col-span-2 space-y-6">
            {/* What you'll learn */}
            <div className="card-lift bg-white rounded-3xl p-6 md:p-8 border-2 border-cream-dark">
              <h2 className="text-xl font-black text-ink mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-brand" />
                <span>What You'll Master</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {(course.whatYouWillLearn || []).map((item, idx) => (
                  <div key={idx} className="flex gap-2.5 text-xs md:text-sm text-ink font-bold">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Curriculum Accordion */}
            <div className="card-lift bg-white rounded-3xl p-6 md:p-8 border-2 border-cream-dark">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-black text-ink">Course Curriculum</h2>
                  <p className="text-xs font-bold text-muted mt-0.5">
                    {course.modules?.length || 0} Modules • {course.lessonCount || 0} Lessons
                  </p>
                </div>
              </div>

              <div className="border-2 border-cream-dark rounded-2xl overflow-hidden divide-y-2 divide-cream-dark">
                {(course.modules || []).map((mod, idx) => (
                  <div key={mod._id || idx} className="bg-white">
                    <button
                      onClick={() => toggleModule(idx)}
                      className="w-full flex items-center justify-between p-4.5 bg-cream/50 hover:bg-cream transition-colors text-left cursor-pointer"
                    >
                      <div>
                        <h3 className="font-black text-sm text-ink">{mod.title}</h3>
                        <p className="text-[11px] font-bold text-muted mt-0.5">
                          {mod.lessons?.length || 0} lessons
                        </p>
                      </div>
                      {expandedModules.includes(idx) ? (
                        <ChevronUp className="w-5 h-5 text-muted" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted" />
                      )}
                    </button>

                    {expandedModules.includes(idx) && (
                      <div className="divide-y divide-cream-dark/60 bg-white">
                        {(mod.lessons || []).map((lesson) => (
                          <div
                            key={lesson._id}
                            className="p-3.5 pl-6 flex items-center justify-between hover:bg-cream/30 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {lesson.type === "video" ? (
                                <PlayCircle className="w-4 h-4 text-brand" />
                              ) : (
                                <FileText className="w-4 h-4 text-brand" />
                              )}
                              <span
                                className={`text-xs md:text-sm font-bold ${
                                  lesson.isPreview && !isEnrolled
                                    ? "text-brand"
                                    : "text-ink"
                                }`}
                              >
                                {lesson.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              {lesson.isPreview && !isEnrolled && (
                                <span className="text-[10px] font-black uppercase tracking-wider bg-brand-light text-brand px-2 py-0.5 rounded-md">
                                  Preview
                                </span>
                              )}
                              <span className="text-xs font-bold text-muted">
                                {lesson.duration}m
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Instructor Bio */}
            <div className="card-lift bg-white rounded-3xl p-6 md:p-8 border-2 border-cream-dark">
              <h2 className="text-xl font-black text-ink mb-5">Lead Faculty Instructor</h2>
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                <div className="w-20 h-20 rounded-2xl bg-brand-light shrink-0 overflow-hidden border-2 border-cream-dark">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                      course.instructor?.name || "Dr Jenkins"
                    )}&background=7c3aed&color=ffffff&bold=true&size=200`}
                    alt="Instructor"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-base font-black text-ink mb-1">
                    {course.instructor?.name || "Dr. Sarah Jenkins, Ph.D."}
                  </h3>
                  <p className="text-xs md:text-sm text-muted font-medium leading-relaxed">
                    {course.instructor?.bio ||
                      "Clinical Neuropsychologist specializing in adolescent stress biology and evidence-based Cognitive Behavioral Interventions."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Sidebar (Right) */}
          <div className="lg:sticky lg:top-8 space-y-6">
            <div className="card-lift bg-white rounded-3xl border-2 border-cream-dark overflow-hidden shadow-lg">
              <div
                className={`h-44 bg-linear-to-br ${
                  course.thumbnailGradient || "from-purple-900 via-indigo-900 to-slate-900"
                } flex items-center justify-center relative`}
              >
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-md">
                  <PlayCircle className="w-10 h-10 text-white" />
                </div>
              </div>

              <div className="p-6 md:p-8">
                <div className="mb-6">
                  {course.price > 0 ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-ink">৳{course.price}</span>
                      {course.originalPrice && (
                        <span className="text-base font-bold text-muted line-through">
                          ৳{course.originalPrice}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-black text-emerald-600">Free Access</span>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md">
                        Student Grant
                      </span>
                    </div>
                  )}
                </div>

                {isEnrolled ? (
                  <Link
                    to={`/courses/${course._id}/learn`}
                    className="block w-full py-3.5 bg-brand text-white rounded-2xl font-black text-xs uppercase tracking-wider text-center hover:bg-brand-dark transition-all shadow-md cursor-pointer"
                  >
                    Enter Learning Room
                  </Link>
                ) : (
                  <button
                    onClick={handleEnrollClick}
                    className="w-full py-3.5 bg-brand text-white rounded-2xl font-black text-xs uppercase tracking-wider text-center hover:bg-brand-dark transition-all shadow-md cursor-pointer"
                  >
                    Enroll Now
                  </button>
                )}

                <div className="mt-3 text-center">
                  <span className="text-[11px] font-bold text-muted">
                    Instant Lifetime Student Access
                  </span>
                </div>

                <div className="mt-6 pt-6 border-t-2 border-cream-dark">
                  <h4 className="font-black text-xs uppercase tracking-wider text-ink mb-3">
                    Course Features:
                  </h4>
                  <ul className="space-y-2.5 text-xs font-bold text-muted">
                    <li className="flex items-center gap-2.5">
                      <PlayCircle className="w-4 h-4 text-brand" /> {course.duration} Hours on-demand video
                    </li>
                    <li className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-brand" /> {course.lessonCount} Structured practical lessons
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-brand" /> Anonymous peer cohort discussion
                    </li>
                    <li className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" /> Official Certificate of Completion
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mock Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border-2 border-cream-dark overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b-2 border-cream-dark flex justify-between items-center bg-cream/40">
              <h3 className="text-base font-black text-ink">Secure Checkout</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-muted hover:text-ink font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
            </div>
            <form onSubmit={processEnrollment} className="p-6 space-y-4">
              <div className="p-4 bg-brand-light rounded-2xl border-2 border-cream-dark flex justify-between items-center">
                <span className="font-black text-xs text-brand-dark line-clamp-1 mr-4">
                  {course.title}
                </span>
                <span className="font-black text-sm text-brand-dark whitespace-nowrap">
                  ৳{course.price}
                </span>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-muted mb-1.5">
                  Card Number
                </label>
                <input
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  className="w-full px-4 py-2.5 bg-cream/40 border-2 border-cream-dark rounded-xl font-mono text-sm text-ink focus:outline-none focus:border-brand"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-muted mb-1.5">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full px-4 py-2.5 bg-cream/40 border-2 border-cream-dark rounded-xl font-mono text-sm text-ink focus:outline-none focus:border-brand"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-muted mb-1.5">
                    CVC
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full px-4 py-2.5 bg-cream/40 border-2 border-cream-dark rounded-xl font-mono text-sm text-ink focus:outline-none focus:border-brand"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={enrolling}
                className="w-full mt-4 py-3.5 bg-brand text-white rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-brand-dark transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {enrolling ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  `Pay ৳${course.price} & Unlock`
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
