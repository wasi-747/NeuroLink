import React, { useState, useEffect } from "react";
import { getAdminCourses, createCourse, deleteCourse } from "../../api/admin";
import { format, parseISO } from "date-fns";
import { toast } from "react-hot-toast";
import { Loader2, BookOpen, Plus, Trash2, Edit } from "lucide-react";

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    instructorName: "",
    price: 0,
    category: "General",
    level: "Beginner",
    thumbnailGradient: "from-blue-500 to-indigo-600"
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await getAdminCourses();
      setCourses(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await deleteCourse(id);
      toast.success("Course deleted");
      setCourses(courses.filter(c => c._id !== id));
    } catch (err) {
      toast.error("Failed to delete course");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        instructor: { name: formData.instructorName, bio: "Instructor Bio" },
        lessonCount: 0,
        duration: 0,
        tags: [formData.category.toLowerCase()]
      };
      const res = await createCourse(payload);
      toast.success("Course created");
      setCourses([res.data.data, ...courses]);
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create course");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40">
        <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-brand-500" /> Course Management
          </h1>
          <p className="text-slate-500 font-medium mt-1">Manage wellness masterclasses.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" /> Add Course
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Course</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Instructor</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {courses.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium">No courses found.</td>
                </tr>
              ) : (
                courses.map(course => (
                  <tr key={course._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 line-clamp-1">{course.title}</div>
                      <div className="text-xs text-slate-500">{course.category} • {course.level}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">{course.instructor.name}</td>
                    <td className="px-6 py-4 font-bold text-brand-600">{course.price === 0 ? 'Free' : `৳${course.price}`}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${course.isPublished ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        {course.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleDelete(course._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-extrabold text-slate-900">Create New Course</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><Trash2 className="w-5 h-5 hidden" /> <span className="text-2xl leading-none">&times;</span></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Instructor Name</label>
                <input required type="text" value={formData.instructorName} onChange={e => setFormData({...formData, instructorName: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Price (৳)</label>
                  <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                  <input required type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500" />
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl mt-6 transition-colors">
                Create Course
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourses;
