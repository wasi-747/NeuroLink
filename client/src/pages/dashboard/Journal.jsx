import React, { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  getEntries,
  createEntry,
  updateEntry,
  deleteEntry,
} from "../../api/journal";
import { toast } from "react-hot-toast";
import {
  BookOpen,
  Plus,
  Save,
  Trash2,
  Edit3,
  Loader2,
  CalendarHeart,
  Clock,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import CrisisModal from "../../components/common/CrisisModal";

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  const btnClass = (isActive) =>
    `p-2 text-sm rounded-lg font-bold transition-colors ${
      isActive
        ? "bg-slate-200 text-slate-900"
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
    }`;

  return (
    <div className="flex flex-wrap gap-1 border-b border-slate-100 p-2 bg-white sticky top-0 z-10 rounded-t-2xl">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={btnClass(editor.isActive("bold"))}
      >
        B
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={btnClass(editor.isActive("italic"))}
      >
        I
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={btnClass(editor.isActive("strike"))}
      >
        S
      </button>
      <div className="w-px h-6 bg-slate-200 mx-2 self-center"></div>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={btnClass(editor.isActive("heading", { level: 2 }))}
      >
        H2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={btnClass(editor.isActive("heading", { level: 3 }))}
      >
        H3
      </button>
      <div className="w-px h-6 bg-slate-200 mx-2 self-center"></div>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btnClass(editor.isActive("bulletList"))}
      >
        • List
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={btnClass(editor.isActive("orderedList"))}
      >
        1. List
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={btnClass(editor.isActive("blockquote"))}
      >
        "Quote"
      </button>
    </div>
  );
};

const Journal = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeEntry, setActiveEntry] = useState(null); // null = new entry
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);

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
        className:
          "prose prose-slate max-w-none focus:outline-none min-h-[400px] p-6 text-slate-700 leading-relaxed",
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
        if (res.data.sentiment?.crisis_detected) {
          setIsCrisisModalOpen(true);
        }
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

  const getSentimentChip = (label) => {
    switch (label) {
      case "POSITIVE":
        return (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-800">
            😊 Positive
          </span>
        );
      case "NEUTRAL":
        return (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
            😐 Neutral
          </span>
        );
      case "NEGATIVE":
        return (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-800">
            😔 Negative
          </span>
        );
      case "CRISIS":
        return (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
            🚨 Crisis
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-20 h-[85vh] flex flex-col">
      <CrisisModal
        isOpen={isCrisisModalOpen}
        setIsOpen={setIsCrisisModalOpen}
      />
      <div className="shrink-0">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink mb-1 flex items-center gap-3">
          <BookOpen className="text-brand" />
          Personal Journal 📖
        </h1>
        <p className="text-muted text-sm font-medium">
          A confidential sanctuary for your reflections, stream-of-consciousness thoughts, and emotional processing.
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        {/* Sidebar: Entry List */}
        <div className="card-lift bg-white flex flex-col overflow-hidden lg:col-span-1 p-0">
          <div className="p-4 border-b-2 border-cream-dark flex justify-between items-center bg-cream/40">
            <h3 className="font-extrabold text-sm text-ink flex items-center gap-2">
              <CalendarHeart className="w-4 h-4 text-brand" />
              Entries ({entries.length})
            </h3>
            <button
              onClick={() => setActiveEntry(null)}
              className="p-1.5 bg-brand-light text-brand rounded-xl hover:bg-brand hover:text-white transition-all cursor-pointer"
              title="New Entry"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-brand" />
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center p-6 text-muted text-xs font-bold">
                No entries yet. Tap + to write your first reflection.
              </div>
            ) : (
              entries.map((entry) => (
                <div
                  key={entry._id}
                  onClick={() => setActiveEntry(entry)}
                  className={`p-3.5 rounded-2xl cursor-pointer transition-all border-2 ${
                    activeEntry?._id === entry._id
                      ? "bg-brand-50 border-brand/40 shadow-xs"
                      : "bg-white border-cream-dark hover:border-slate-300 hover:bg-cream/20"
                  }`}
                >
                  <h4
                    className={`font-bold text-xs truncate ${
                      activeEntry?._id === entry._id
                        ? "text-brand"
                        : "text-ink"
                    }`}
                  >
                    {entry.title || "Untitled"}
                  </h4>
                  <div className="flex items-center justify-between mt-2 text-[11px] text-muted font-semibold">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {entry.createdAt ? format(parseISO(entry.createdAt), "MMM d, yyyy") : "Today"}
                    </div>
                    {getSentimentChip(entry.sentimentLabel)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="card-lift bg-white flex flex-col overflow-hidden lg:col-span-3 p-0">
          <div className="p-5 border-b-2 border-cream-dark flex items-center justify-between bg-white relative z-20">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Entry Title..."
              className="text-2xl lg:text-3xl font-black text-ink placeholder:text-muted/50 border-none focus:ring-0 p-0 w-full bg-transparent outline-none"
            />
            <div className="flex items-center gap-2 shrink-0 ml-4">
              {activeEntry && (
                <button
                  onClick={() => handleDelete(activeEntry._id)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-100 cursor-pointer"
                  title="Delete Entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="btn-primary text-xs py-2 px-4 flex items-center gap-2 cursor-pointer"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : activeEntry ? (
                  <Edit3 className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isSaving ? "Saving..." : activeEntry ? "Update" : "Save Entry"}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-cream/20 relative">
            <MenuBar editor={editor} />
            <div className="p-4 mx-auto max-w-4xl w-full">
              <div className="bg-white min-h-[500px] rounded-2xl border-2 border-cream-dark shadow-xs overflow-hidden">
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

