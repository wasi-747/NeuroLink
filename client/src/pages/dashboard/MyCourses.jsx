import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyEnrollments } from "../../api/course";
import { Loader2, PlayCircle, CheckCircle, Award } from "lucide-react";

const MyCourses = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await getMyEnrollments();
        setEnrollments(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Courses</h1>
        <p className="text-slate-500 font-medium mt-2">Pick up exactly where you left off and track your progress.</p>
      </div>

      {enrollments.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center">
          <Award className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">No active courses</h3>
          <p className="text-slate-500 mb-6 font-medium">You haven't enrolled in any wellness courses yet.</p>
          <Link to="/courses" className="px-6 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors">
            Browse Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {enrollments.map(enrollment => {
            const course = enrollment.courseId;
            const completedCount = enrollment.completedLessons?.length || 0;
            const totalCount = course.lessonCount || 1;
            const progress = Math.round((completedCount / totalCount) * 100);
            const isCompleted = completedCount === totalCount;

            return (
              <div key={enrollment._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div className={`h-32 bg-gradient-to-br ${course.thumbnailGradient || 'from-slate-400 to-slate-500'} relative`}>
                  {isCompleted && (
                    <div className="absolute top-4 right-4 bg-emerald-500 text-white p-2 rounded-full shadow-lg">
                      <Award className="w-5 h-5" />
                    </div>
                  )}
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 font-bold text-[10px] uppercase tracking-wider rounded-md">
                      {course.level}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-extrabold text-slate-900 mb-6 line-clamp-2">
                    {course.title}
                  </h3>
                  
                  <div className="mt-auto space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-2">
                        <span className="text-slate-500">Overall Progress</span>
                        <span className={isCompleted ? "text-emerald-500" : "text-brand-600"}>{progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500' : 'bg-brand-500'}`} style={{ width: `${progress}%` }} />
                      </div>
                      <div className="text-xs font-medium text-slate-400 mt-2">
                        {completedCount} / {totalCount} lessons completed
                      </div>
                    </div>

                    <Link 
                      to={`/courses/${course._id}/learn`} 
                      className={`block w-full py-3 text-center font-bold rounded-xl transition-colors flex justify-center items-center gap-2 ${
                        isCompleted 
                          ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-100' 
                          : 'bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-100'
                      }`}
                    >
                      {isCompleted ? (
                        <><Award className="w-4 h-4" /> View Certificate</>
                      ) : (
                        <><PlayCircle className="w-4 h-4" /> Continue Learning</>
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
