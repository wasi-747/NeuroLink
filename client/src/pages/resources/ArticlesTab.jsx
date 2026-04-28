import React, { useState, useEffect } from "react";
import { getArticles } from "../../api/resource";
import { Loader2, Search, Clock, Tag } from "lucide-react";

const CATEGORIES = [
  "All", "Anxiety", "Depression", "Sleep", 
  "Relationships", "Academic Stress", "Self-Care", "Mindfulness"
];

const ArticlesTab = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const res = await getArticles(category, search);
        setArticles(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    // Simple debounce for search
    const delayDebounceFn = setTimeout(() => {
      fetchArticles();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [category, search]);

  return (
    <div>
      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                category === cat 
                  ? "bg-slate-800 text-white shadow-md" 
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
        </div>
      ) : articles.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
          <p className="text-slate-500 font-medium text-lg">No articles found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, idx) => (
            <div 
              key={article._id} 
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all group flex flex-col animate-in fade-in zoom-in-95 duration-500 fill-mode-both"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Thumbnail Area */}
              <div className={`h-40 bg-gradient-to-br ${article.thumbnailGradient} relative p-6 flex flex-col justify-end`}>
                <span className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {article.category}
                </span>
                <h3 className="text-xl font-extrabold text-white leading-tight line-clamp-2">
                  {article.title}
                </h3>
              </div>

              {/* Content Area */}
              <div className="p-6 flex-1 flex flex-col">
                <p className="text-slate-600 text-sm mb-4 line-clamp-3 leading-relaxed flex-1">
                  {article.content}
                </p>
                
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>{article.readTime} min read</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate max-w-[50%]">
                    <Tag className="w-4 h-4 shrink-0" />
                    <span className="truncate">{article.tags.join(", ")}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArticlesTab;
