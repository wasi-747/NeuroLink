import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyEnrollments } from "../../api/course";
import {
  Loader2,
  PlayCircle,
  CheckCircle,
  Award,
  BookOpen,
  ArrowRight,
  GraduationCap,
  Sparkles,
  Compass,
} from "lucide-react";
import confetti from "canvas-confetti";

const MyCourses = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await getMyEnrollments();
        setEnrollments(res.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch enrollments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  const totalEnrolled = enrollments.length;
  const completedCourses = enrollments.filter((e) => {
    const completedCount = e.completedLessons?.length || 0;
    const totalCount = e.courseId?.lessonCount || 1;
    return completedCount >= totalCount;
  }).length;
  const inProgressCourses = totalEnrolled - completedCourses;

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-28 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-brand" />
        <p className="text-xs font-bold text-muted uppercase tracking-wider">
          Loading your learning sanctuary...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8 animate-in fade-in duration-300">
      {/* Mobile-aligned Hero Banner */}
      <div className="card-lift p-6 md:p-8 bg-linear-to-br from-[#3b0764] via-[#581c87] to-[#1e1b4b] text-white relative overflow-hidden shadow-lg border-none">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <GraduationCap className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 md:w-3/4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-black uppercase tracking-wider px-3 py-1 bg-purple-400/20 text-purple-200 rounded-full inline-flex items-center gap-1.5 border border-purple-400/30">
              <Award className="w-3.5 h-3.5 text-purple-300" />
              STUDENT ACADEMY
            </span>
            <span className="text-xs font-bold text-purple-200/80 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Enrolled Masterclasses
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 text-white">
            My Learning Journey 🎓
          </h1>
          <p className="text-purple-100/90 text-sm md:text-base font-medium leading-relaxed mb-6 max-w-2xl">
            Pick up right where you left off, reinforce healthy neuroplasticity habits, and earn official wellness completion certificates.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 max-w-md bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
            <div className="text-center">
              <div className="text-2xl font-black text-white">{totalEnrolled}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-purple-200">Enrolled</div>
            </div>
            <div className="text-center border-x border-white/20">
              <div className="text-2xl font-black text-emerald-300">{completedCourses}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-purple-200">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-amber-300">{inProgressCourses}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-purple-200">In Progress</div>
            </div>
          </div>
        </div>
      </div>

      {enrollments.length === 0 ? (
        <div className="card-lift p-12 text-center bg-white rounded-3xl border-2 border-cream-dark">
          <div className="w-20 h-20 bg-brand-light rounded-3xl flex items-center justify-center text-brand mx-auto mb-4 border-2 border-cream-dark shadow-xs">
            <Compass className="w-10 h-10 text-brand" />
          </div>
          <h3 className="text-2xl font-black text-ink mb-2">No Active Courses Yet</h3>
          <p className="text-muted mb-6 font-medium max-w-md mx-auto text-sm">
            Explore our clinician-curated masterclasses designed specifically for student mental wellness, stress relief, and sleep hygiene.
          </p>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-2xl font-extrabold text-sm hover:bg-brand-dark transition-all shadow-md cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Browse Masterclass Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {enrollments.map((enrollment) => {
            const course = enrollment.courseId;
            if (!course) return null;

            const completedCount = enrollment.completedLessons?.length || 0;
            const totalCount = course.lessonCount || 1;
            const progress = Math.min(100, Math.round((completedCount / totalCount) * 100));
            const isCompleted = progress === 100;

            return (
              <div
                key={enrollment._id}
                className="card-lift bg-white rounded-3xl border-2 border-cream-dark overflow-hidden flex flex-col transition-all"
              >
                {/* Thumbnail Banner */}
                <div
                  className={`h-36 bg-linear-to-br ${
                    course.thumbnailGradient || "from-purple-900 via-indigo-900 to-slate-900"
                  } p-6 relative flex flex-col justify-between text-white`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white font-extrabold text-[10px] uppercase tracking-wider rounded-full border border-white/20">
                      {course.category || "Wellness"}
                    </span>
                    {isCompleted ? (
                      <span className="px-3 py-1 bg-emerald-500 text-white font-black text-[10px] uppercase tracking-wider rounded-full shadow-md flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Completed
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-brand-light/90 text-brand-dark font-black text-[10px] uppercase tracking-wider rounded-full shadow-md">
                        {course.level || "All Levels"}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold text-white/90">
                    <BookOpen className="w-4 h-4" />
                    <span>{course.lessonCount || 0} Lessons</span>
                    <span>•</span>
                    <span>{course.duration || 1}h Total</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-black text-ink mb-2 line-clamp-2 leading-snug">
                    {course.title}
                  </h3>
                  <p className="text-xs font-medium text-muted mb-6 line-clamp-2">
                    {course.description || "Master mindfulness and self-regulation techniques."}
                  </p>

                  <div className="mt-auto space-y-4">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-xs font-extrabold mb-1.5">
                        <span className="text-muted">Mastery Progress</span>
                        <span className={isCompleted ? "text-emerald-600" : "text-brand"}>
                          {progress}%
                        </span>
                      </div>
                      <div className="h-2.5 w-full bg-cream rounded-full overflow-hidden border border-cream-dark">
                        <div
                          className={`h-full transition-all duration-700 rounded-full ${
                            isCompleted ? "bg-emerald-500" : "bg-brand"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="text-[11px] font-bold text-muted mt-1.5 flex justify-between items-center">
                        <span>{completedCount} of {totalCount} lessons completed</span>
                        {isCompleted && (
                          <span className="text-emerald-600 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Certified
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link
                      to={`/courses/${course._id}/learn`}
                      onClick={() => {
                        if (isCompleted) {
                          confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
                        }
                      }}
                      className={`w-full py-3.5 text-center font-black text-xs uppercase tracking-wider rounded-2xl transition-all flex justify-center items-center gap-2 cursor-pointer shadow-sm ${
                        isCompleted
                          ? "bg-amber-50 text-amber-900 hover:bg-amber-100 border-2 border-amber-200"
                          : "bg-brand text-white hover:bg-brand-dark"
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <Award className="w-4 h-4 text-amber-600" />
                          <span>View Certificate & Notes</span>
                        </>
                      ) : (
                        <>
                          <PlayCircle className="w-4 h-4" />
                          <span>Resume Learning</span>
                        </>
                      )}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
