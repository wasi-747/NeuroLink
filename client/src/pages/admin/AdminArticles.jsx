import React, { useState, useEffect } from "react";
import { getAdminArticles, createArticle, deleteArticle } from "../../api/admin";
import { format, parseISO } from "date-fns";
import { toast } from "react-hot-toast";
import { Loader2, FileText, Plus, Trash2 } from "lucide-react";

const AdminArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "Mental Health",
    readTime: 5,
    content: "",
    thumbnailGradient: "from-purple-400 to-pink-500"
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const res = await getAdminArticles();
      setArticles(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch articles");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;
    try {
      await deleteArticle(id);
      toast.success("Article deleted");
      setArticles(articles.filter(a => a._id !== id));
    } catch (err) {
      toast.error("Failed to delete article");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        tags: [formData.category.toLowerCase()]
      };
      const res = await createArticle(payload);
      toast.success("Article created");
      setArticles([res.data.data, ...articles]);
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create article");
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
            <FileText className="w-8 h-8 text-brand-500" /> Article Management
          </h1>
          <p className="text-slate-500 font-medium mt-1">Manage library resources and articles.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" /> Add Article
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Article Title</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Read Time</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {articles.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium">No articles found.</td>
                </tr>
              ) : (
                articles.map(article => (
                  <tr key={article._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 line-clamp-1">{article.title}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">{article.category}</td>
                    <td className="px-6 py-4 text-slate-500">{article.readTime} min</td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {format(parseISO(article.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleDelete(article._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-extrabold text-slate-900">Create New Article</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><span className="text-2xl leading-none">&times;</span></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                  <input required type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Read Time (mins)</label>
                  <input required type="number" value={formData.readTime} onChange={e => setFormData({...formData, readTime: Number(e.target.value)})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Content</label>
                <textarea required rows={6} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 resize-none"></textarea>
              </div>
              <button type="submit" className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl mt-6 transition-colors">
                Publish Article
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminArticles;
