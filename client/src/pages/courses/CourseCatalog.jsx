import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCourses } from "../../api/course";
import { Search, Loader2, Star, Clock, BookOpen, Filter, CheckCircle } from "lucide-react";

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
    
    // Debounce search slightly
    const timer = setTimeout(() => {
      fetchCourses();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, category]);

  const categories = ["All", "Anxiety", "Stress", "Sleep", "Mindfulness"];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in duration-500">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
          Wellness <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">Masterclasses</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
          Evidence-based courses to help you build resilience, manage stress, and thrive.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-10">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-800 placeholder:text-slate-400"
            placeholder="Search for courses, topics, or instructors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <Filter className="w-5 h-5 text-slate-400 mr-2 shrink-0" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all border-2 ${
                category === cat 
                  ? "bg-slate-900 border-slate-900 text-white shadow-md" 
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-3xl h-[450px] shadow-sm border border-slate-100 overflow-hidden animate-pulse">
              <div className="h-48 bg-slate-200" />
              <div className="p-6 space-y-4">
                <div className="h-4 bg-slate-200 rounded w-1/4" />
                <div className="h-6 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-full" />
                <div className="h-4 bg-slate-200 rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-slate-800 mb-2">No courses found</h3>
          <p className="text-slate-500 font-medium">Try adjusting your search or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map(course => (
            <Link key={course._id} to={`/courses/${course._id}`} className="group bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
              {/* Thumbnail */}
              <div className={`h-48 bg-gradient-to-br ${course.thumbnailGradient} relative overflow-hidden shrink-0`}>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-800">
                  {course.level}
                </div>
                {course.price === 0 && (
                  <div className="absolute top-4 right-4 bg-emerald-500 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm">
                    FREE
                  </div>
                )}
                {/* Decorative overlay */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/20 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700" />
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-1 text-amber-500 mb-3">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold text-sm text-slate-700">{course.rating} <span className="text-slate-400 font-medium">({course.enrollmentCount})</span></span>
                </div>
                
                <h3 className="text-xl font-extrabold text-slate-900 leading-tight mb-2 group-hover:text-brand-600 transition-colors line-clamp-2">
                  {course.title}
                </h3>
                
                <p className="text-slate-600 font-medium text-sm mb-6 line-clamp-2 flex-1">
                  {course.description}
                </p>

                <div className="flex items-center gap-4 text-xs font-bold text-slate-500 mb-6 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> {course.duration}h
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" /> {course.lessonCount} lessons
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                      {course.instructor.name.charAt(0)}
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{course.instructor.name}</span>
                  </div>
                  <div className="text-right">
                    {course.price > 0 ? (
                      <div className="flex flex-col">
                        {course.originalPrice && (
                          <span className="text-xs text-slate-400 line-through font-semibold">৳{course.originalPrice}</span>
                        )}
                        <span className="text-lg font-black text-slate-900">৳{course.price}</span>
                      </div>
                    ) : (
                      <span className="text-lg font-black text-emerald-600">Free</span>
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
