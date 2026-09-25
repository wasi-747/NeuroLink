import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCourses } from "../../api/course";
import {
  Search,
  Loader2,
  Star,
  Clock,
  BookOpen,
  Filter,
  CheckCircle,
  GraduationCap,
  Sparkles,
  ArrowUpRight,
  Award,
} from "lucide-react";

// Aligned with mobile CoursesScreen.jsx
const CATEGORIES = ["All", "Stress", "Anxiety", "Sleep", "Mindfulness"];

const CourseCatalog = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const res = await getCourses({
          search: searchTerm,
          category: category !== "All" ? category : undefined,
        });
        setCourses(res.data.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchCourses();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, category]);

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-8 animate-in fade-in duration-400">
      {/* Hero Banner (Mobile Courses Screen Parity) */}
      <div className="card-lift p-6 md:p-10 bg-linear-to-br from-[#3b0764] via-[#581c87] to-[#1e1b4b] text-white relative overflow-hidden shadow-lg border-none">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <GraduationCap className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 md:w-3/4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-black uppercase tracking-wider px-3 py-1 bg-purple-400/20 text-purple-200 rounded-full inline-flex items-center gap-1.5 border border-purple-400/30">
              <GraduationCap className="w-3.5 h-3.5 text-purple-300" />
              EVIDENCE-BASED MASTERCLASSES
            </span>
            <span className="text-xs font-bold text-purple-200/80 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Self-Paced Modules
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2 text-white">
            Psychoeducation & Growth 🎓
          </h1>
          <p className="text-purple-100/90 text-sm md:text-base font-medium leading-relaxed mb-6 max-w-2xl">
            Interactive bite-sized courses designed by neuroscientists to rewire anxiety, conquer exam stress, and master deep sleep.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/courses/learning-path"
              className="px-5 py-2.5 bg-white text-purple-950 font-extrabold text-xs rounded-xl hover:bg-purple-50 transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Personalized Learning Path</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Category Pills (Mobile Parity) & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => {
            const isActive = category === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-150 shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-brand text-white shadow-sm scale-105"
                    : "bg-white border-2 border-cream-dark text-muted hover:text-ink hover:border-slate-300"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-cream-dark rounded-2xl focus:border-brand font-medium text-xs text-ink placeholder:text-muted/60 outline-none"
            placeholder="Search topic or instructor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Courses List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="card-lift bg-white h-80 animate-pulse border-2 border-cream-dark"
            />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="card-lift p-12 text-center bg-white border-2 border-cream-dark">
          <BookOpen className="w-16 h-16 text-muted/60 mx-auto mb-3" />
          <h3 className="text-lg font-black text-ink mb-1">
            No courses found
          </h3>
          <p className="text-xs text-muted max-w-sm mx-auto">
            Try adjusting your search keyword or switching category tabs.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link
              key={course._id}
              to={`/courses/${course._id}`}
              className="card-lift bg-white border-2 border-cream-dark overflow-hidden flex flex-col group p-0"
            >
              {/* Thumbnail */}
              <div
                className={`h-40 bg-gradient-to-br ${
                  course.thumbnailGradient || "from-brand-600 to-indigo-600"
                } relative overflow-hidden shrink-0 border-b-2 border-cream-dark`}
              >
                <div className="absolute inset-0 bg-black/15 group-hover:bg-transparent transition-colors" />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase text-ink tracking-wider">
                  {course.level}
                </div>
                {course.price === 0 && (
                  <div className="absolute top-3 right-3 bg-emerald-500 px-2.5 py-0.5 rounded-lg text-[10px] font-black text-white shadow-xs">
                    FREE
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-1 text-amber-500 mb-2">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="font-bold text-xs text-ink">
                    {course.rating}{" "}
                    <span className="text-muted font-normal text-[11px]">
                      ({course.enrollmentCount} enrolled)
                    </span>
                  </span>
                </div>

                <h3 className="text-base font-black text-ink leading-snug mb-1.5 group-hover:text-brand transition-colors line-clamp-2">
                  {course.title}
                </h3>

                <p className="text-muted font-medium text-xs mb-4 line-clamp-2 flex-1">
                  {course.description}
                </p>

                <div className="flex items-center gap-4 text-[11px] font-bold text-muted mb-4 pt-3 border-t-2 border-cream-dark/60">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-brand" /> {course.duration}h
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-brand" />{" "}
                    {course.lessonCount} lessons
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-brand-light text-brand flex items-center justify-center text-[10px] font-black">
                      {course.instructor?.name?.charAt(0) || "N"}
                    </div>
                    <span className="text-xs font-bold text-ink truncate max-w-[120px]">
                      {course.instructor?.name || "Instructor"}
                    </span>
                  </div>
                  <div>
                    {course.price > 0 ? (
                      <span className="text-sm font-black text-ink">
                        ৳{course.price}
                      </span>
                    ) : (
                      <span className="text-xs font-black text-emerald-600 bg-mint/15 px-2 py-0.5 rounded-md">
                        Free Access
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseCatalog;

