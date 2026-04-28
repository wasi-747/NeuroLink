import React, { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { getEntries, createEntry, updateEntry, deleteEntry } from "../../api/journal";
import { toast } from "react-hot-toast";
import { BookOpen, Plus, Save, Trash2, Edit3, Loader2, CalendarHeart, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  const btnClass = (isActive) =>
    `p-2 text-sm rounded-lg font-bold transition-colors ${
      isActive ? "bg-slate-200 text-slate-900" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
    }`;

  return (
    <div className="flex flex-wrap gap-1 border-b border-slate-100 p-2 bg-white sticky top-0 z-10 rounded-t-2xl">
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive("bold"))}>B</button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive("italic"))}>I</button>
      <button onClick={() => editor.chain().focus().toggleStrike().run()} className={btnClass(editor.isActive("strike"))}>S</button>
      <div className="w-px h-6 bg-slate-200 mx-2 self-center"></div>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(editor.isActive("heading", { level: 2 }))}>H2</button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btnClass(editor.isActive("heading", { level: 3 }))}>H3</button>
      <div className="w-px h-6 bg-slate-200 mx-2 self-center"></div>
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive("bulletList"))}>• List</button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive("orderedList"))}>1. List</button>
      <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btnClass(editor.isActive("blockquote"))}>"Quote"</button>
    </div>
  );
};

const Journal = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeEntry, setActiveEntry] = useState(null); // null = new entry
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Write your thoughts here... How was your day?",
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        className: "prose prose-slate max-w-none focus:outline-none min-h-[400px] p-6 text-slate-700 leading-relaxed",
      },
    },
  });

  const fetchEntries = async () => {
    try {
      const res = await getEntries();
      if (res.data?.data) {
        setEntries(res.data.data);
      }
    } catch (err) {
      toast.error("Failed to load journal entries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  // Update editor content when switching active entries
  useEffect(() => {
    if (editor) {
      if (activeEntry) {
        setTitle(activeEntry.title);
        editor.commands.setContent(activeEntry.content);
      } else {
        setTitle("");
        editor.commands.setContent("");
      }
    }
  }, [activeEntry, editor]);

  const handleSave = async () => {
    if (!title.trim() && !editor.getHTML() !== "<p></p>") {
      toast.error("Please add a title and some content.");
      return;
    }
    
    setIsSaving(true);
    try {
      const entryData = {
        title: title || "Untitled Entry",
        content: editor.getHTML(),
        tags: [],
      };

      if (activeEntry) {
        await updateEntry(activeEntry._id, entryData);
        toast.success("Entry updated successfully!");
      } else {
        const res = await createEntry(entryData);
        toast.success("New entry saved!");
        setActiveEntry(res.data.data); // Switch to editing mode for the new entry
      }
      fetchEntries();
    } catch (err) {
      toast.error("Failed to save entry.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    try {
      await deleteEntry(id);
      toast.success("Entry deleted");
      if (activeEntry?._id === id) setActiveEntry(null);
      fetchEntries();
    } catch (err) {
      toast.error("Failed to delete entry");
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-[85vh] flex flex-col">
      <div className="mb-6 shrink-0">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2 flex items-center gap-3">
          <BookOpen className="text-blue-500" />
          Personal Journal
        </h1>
        <p className="text-slate-500">A safe space for your thoughts, reflections, and daily experiences.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        
        {/* Sidebar: Entry List */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden lg:col-span-1">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <CalendarHeart className="w-5 h-5 text-blue-500" />
              Entries
            </h3>
            <button
              onClick={() => setActiveEntry(null)}
              className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              title="New Entry"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {loading ? (
              <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
            ) : entries.length === 0 ? (
              <div className="text-center p-6 text-slate-500 text-sm font-medium">No entries yet. Click + to start your first one.</div>
            ) : (
              entries.map((entry) => (
                <div
                  key={entry._id}
                  onClick={() => setActiveEntry(entry)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border ${
                    activeEntry?._id === entry._id
                      ? "bg-blue-50 border-blue-200 ring-1 ring-blue-100"
                      : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <h4 className={`font-semibold truncate ${activeEntry?._id === entry._id ? "text-blue-800" : "text-slate-800"}`}>
                    {entry.title}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    {format(parseISO(entry.createdAt), "MMM d, yyyy")}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden lg:col-span-3">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white relative z-20">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Entry Title..."
              className="text-2xl lg:text-3xl font-bold text-slate-800 placeholder-slate-300 border-none focus:ring-0 p-0 w-full bg-transparent outline-none"
            />
            <div className="flex items-center gap-3 shrink-0 ml-4">
              {activeEntry && (
                <button
                  onClick={() => handleDelete(activeEntry._id)}
                  className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-100"
                  title="Delete Entry"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-70"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : activeEntry ? <Edit3 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                {isSaving ? "Saving..." : activeEntry ? "Update" : "Save"}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-50/30 relative">
            <MenuBar editor={editor} />
            <div className="p-4 mx-auto max-w-4xl w-full">
              <div className="bg-white min-h-[500px] rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <EditorContent editor={editor} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Journal;
