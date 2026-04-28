import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Loader2, Send } from "lucide-react";

const CATEGORIES = [
  "Academic Pressure", "Exam Stress", "Anxiety", "Depression",
  "Relationship Stress", "Family Issues", "Loneliness", "Sleep Problems",
  "Self-Esteem", "General Support"
];

const postSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be under 100 characters"),
  content: z.string().min(10, "Content must be at least 10 characters").max(1000, "Content must be under 1000 characters"),
  category: z.enum(CATEGORIES, { errorMap: () => ({ message: "Please select a valid category" }) }),
});

const CreatePostForm = ({ isOpen, onClose, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: { title: "", content: "", category: "" }
  });

  const contentValue = watch("content") || "";

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    const success = await onSubmit(data);
    setIsSubmitting(false);
    if (success) {
      reset();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800">Create Anonymous Post</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Your real identity will remain completely hidden.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
            <select
              {...register("category")}
              className={`w-full p-3 bg-slate-50 border ${errors.category ? "border-red-300 ring-1 ring-red-500" : "border-slate-200 focus:ring-2 focus:ring-brand-500"} rounded-xl text-slate-900 font-medium focus:outline-none transition-all`}
            >
              <option value="" disabled>Select a topic...</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="mt-2 text-sm text-red-500 font-medium">{errors.category.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
            <input
              type="text"
              {...register("title")}
              placeholder="Give your post a descriptive title"
              className={`w-full p-3 bg-slate-50 border ${errors.title ? "border-red-300 ring-1 ring-red-500" : "border-slate-200 focus:ring-2 focus:ring-brand-500"} rounded-xl text-slate-900 font-medium focus:outline-none transition-all`}
            />
            {errors.title && <p className="mt-2 text-sm text-red-500 font-medium">{errors.title.message}</p>}
          </div>

          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="block text-sm font-semibold text-slate-700">What's on your mind?</label>
              <span className={`text-xs font-semibold ${contentValue.length > 950 ? "text-red-500" : "text-slate-400"}`}>
                {contentValue.length} / 1000
              </span>
            </div>
            <textarea
              {...register("content")}
              rows={6}
              placeholder="Share your thoughts, ask for advice, or vent. We're here to listen."
              className={`w-full p-4 bg-slate-50 border ${errors.content ? "border-red-300 ring-1 ring-red-500" : "border-slate-200 focus:ring-2 focus:ring-brand-500"} rounded-xl text-slate-900 font-medium focus:outline-none transition-all resize-none`}
            />
            {errors.content && <p className="mt-2 text-sm text-red-500 font-medium">{errors.content.message}</p>}
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-50">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl font-bold bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 transition-all shadow-sm hover:shadow-md flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {isSubmitting ? "Posting..." : "Post Anonymously"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default CreatePostForm;
