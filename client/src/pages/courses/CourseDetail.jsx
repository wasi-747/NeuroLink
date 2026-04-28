import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getCourse, enrollCourse } from "../../api/course";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import { Loader2, PlayCircle, FileText, CheckCircle, Clock, Star, Users, ArrowLeft, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";

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
        // Need a way to check if enrolled if user is logged in
        // For simplicity, we just try to fetch it. If backend strips videos, that's fine.
        const res = await getCourse(id);
        setCourse(res.data.data);
        
        // Also check enrollment status if user is logged in
        if (user) {
          const { getEnrollmentStatus } = await import("../../api/course");
          const statusRes = await getEnrollmentStatus(id);
          setIsEnrolled(statusRes.data.isEnrolled);
          if (statusRes.data.isEnrolled && statusRes.data.fullModules) {
            setCourse(prev => ({ ...prev, modules: statusRes.data.fullModules }));
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
      setExpandedModules(expandedModules.filter(i => i !== index));
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
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    try {
      await enrollCourse(course._id);
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
      <div className="flex justify-center items-center py-40">
        <Loader2 className="w-12 h-12 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="bg-slate-50 min-h-screen pb-20 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="bg-slate-900 text-white pt-8 pb-20 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-900/30 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <Link to="/courses" className="inline-flex items-center gap-2 text-slate-400 hover:text-white font-semibold text-sm mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to courses
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-brand-500/20 text-brand-300 font-bold text-xs rounded-full border border-brand-500/30">
                  {course.category}
                </span>
                <span className="px-3 py-1 bg-white/10 text-slate-300 font-bold text-xs rounded-full border border-white/10">
                  {course.level}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                {course.title}
              </h1>
              
              <p className="text-lg md:text-xl text-slate-300 font-medium leading-relaxed max-w-2xl">
                {course.description}
              </p>
              
              <div className="flex flex-wrap items-center gap-6 pt-4 text-sm font-semibold text-slate-300">
                <div className="flex items-center gap-2 text-amber-400">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="text-white text-base">{course.rating}</span>
                  <span>({course.enrollmentCount} enrolled)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" /> {course.duration} hours
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" /> {course.lessonCount} lessons
                </div>
              </div>
              
              <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-lg">
                  {course.instructor.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm text-slate-400">Created by</div>
                  <div className="font-bold text-white">{course.instructor.name}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Content (Left) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* What you'll learn */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-6">What you'll learn</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {course.whatYouWillLearn.map((item, idx) => (
                  <div key={idx} className="flex gap-3 text-slate-700 font-medium">
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Curriculum Accordion */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Course Curriculum</h2>
              <p className="text-slate-500 font-medium mb-6">{course.modules.length} modules • {course.lessonCount} lessons</p>
              
              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-200">
                {course.modules.map((mod, idx) => (
                  <div key={mod._id} className="bg-white">
                    <button 
                      onClick={() => toggleModule(idx)}
                      className="w-full flex items-center justify-between p-5 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                    >
                      <div>
                        <h3 className="font-bold text-slate-900">{mod.title}</h3>
                        <p className="text-sm font-medium text-slate-500 mt-1">{mod.lessons.length} lessons</p>
                      </div>
                      {expandedModules.includes(idx) ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                    </button>
                    
                    {expandedModules.includes(idx) && (
                      <div className="divide-y divide-slate-100">
                        {mod.lessons.map(lesson => (
                          <div key={lesson._id} className="p-4 pl-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                              {lesson.type === 'video' ? <PlayCircle className="w-5 h-5 text-slate-400" /> : 
                               lesson.type === 'article' ? <FileText className="w-5 h-5 text-slate-400" /> :
                               <CheckCircle className="w-5 h-5 text-slate-400" />}
                              <span className={`font-medium ${lesson.isPreview && !isEnrolled ? 'text-brand-600' : 'text-slate-700'}`}>
                                {lesson.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              {lesson.isPreview && !isEnrolled && (
                                <span className="text-xs font-bold bg-brand-100 text-brand-700 px-2 py-1 rounded">Preview</span>
                              )}
                              <span className="text-sm font-medium text-slate-400">{lesson.duration}m</span>
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
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Your Instructor</h2>
              <div className="flex gap-6">
                <div className="w-24 h-24 rounded-full bg-slate-200 shrink-0 overflow-hidden">
                  <img src={`https://ui-avatars.com/api/?name=${course.instructor.name.replace(' ', '+')}&size=200`} alt="Instructor" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{course.instructor.name}</h3>
                  <p className="text-slate-600 font-medium leading-relaxed">{course.instructor.bio}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Sticky Sidebar (Right) */}
          <div className="lg:sticky lg:top-8 space-y-6">
            <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
              <div className={`h-48 bg-gradient-to-br ${course.thumbnailGradient} flex items-center justify-center`}>
                <PlayCircle className="w-16 h-16 text-white/50" />
              </div>
              <div className="p-8">
                <div className="mb-6">
                  {course.price > 0 ? (
                    <div className="flex items-end gap-3">
                      <span className="text-4xl font-black text-slate-900">৳{course.price}</span>
                      {course.originalPrice && <span className="text-xl font-bold text-slate-400 line-through mb-1">৳{course.originalPrice}</span>}
                    </div>
                  ) : (
                    <span className="text-4xl font-black text-emerald-600">Free</span>
                  )}
                </div>

                {isEnrolled ? (
                  <Link to={`/courses/${course._id}/learn`} className="block w-full py-4 bg-brand-600 text-white rounded-xl font-bold text-center hover:bg-brand-700 transition-colors shadow-md hover:shadow-lg">
                    Go to Course
                  </Link>
                ) : (
                  <button onClick={handleEnrollClick} className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold text-center hover:bg-brand-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                    Enroll Now
                  </button>
                )}

                <div className="mt-4 text-center">
                  <span className="text-xs font-semibold text-slate-500">30-Day Money-Back Guarantee</span>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100">
                  <h4 className="font-bold text-slate-900 mb-4">This course includes:</h4>
                  <ul className="space-y-3 text-sm font-medium text-slate-600">
                    <li className="flex items-center gap-3"><PlayCircle className="w-4 h-4 text-slate-400" /> {course.duration} hours on-demand video</li>
                    <li className="flex items-center gap-3"><FileText className="w-4 h-4 text-slate-400" /> {course.lessonCount} structured lessons</li>
                    <li className="flex items-center gap-3"><Users className="w-4 h-4 text-slate-400" /> Community access</li>
                    <li className="flex items-center gap-3"><ShieldCheck className="w-4 h-4 text-slate-400" /> Certificate of completion</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Mock Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-extrabold text-slate-900">Secure Checkout</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600">
                <ChevronUp className="w-6 h-6 rotate-180" />
              </button>
            </div>
            <form onSubmit={processEnrollment} className="p-6 space-y-4">
              <div className="p-4 bg-brand-50 rounded-xl mb-6 border border-brand-100 flex justify-between items-center">
                <span className="font-bold text-brand-900 line-clamp-1 mr-4">{course.title}</span>
                <span className="font-black text-brand-700 whitespace-nowrap">৳{course.price}</span>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Card Number</label>
                <input type="text" placeholder="0000 0000 0000 0000" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" required />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Expiry Date</label>
                  <input type="text" placeholder="MM/YY" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">CVC</label>
                  <input type="text" placeholder="123" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" required />
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={enrolling}
                className="w-full mt-6 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                {enrolling ? <Loader2 className="w-5 h-5 animate-spin" /> : `Pay ৳${course.price}`}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CourseDetail;
