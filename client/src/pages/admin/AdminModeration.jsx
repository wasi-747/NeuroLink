import React, { useState, useEffect } from "react";
import { getReports, resolveReport } from "../../api/admin";
import { format, parseISO } from "date-fns";
import { toast } from "react-hot-toast";
import {
  Loader2,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  Trash2,
  ShieldCheck,
  Flag,
} from "lucide-react";

const AdminModeration = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await getReports();
      setReports(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (reportId, action) => {
    try {
      await resolveReport(reportId, action);
      toast.success("Report resolved successfully");
      // Remove from queue
      setReports(reports.filter((r) => r._id !== reportId));
    } catch (err) {
      toast.error("Failed to resolve report");
    }
  };

  const getSentimentDot = (label) => {
    const dotClass = "w-3 h-3 rounded-full";
    switch (label) {
      case "POSITIVE":
        return (
          <div
            className={`${dotClass} bg-green-500`}
            title="Positive Sentiment"
          />
        );
      case "NEUTRAL":
        return (
          <div
            className={`${dotClass} bg-blue-500`}
            title="Neutral Sentiment"
          />
        );
      case "NEGATIVE":
        return (
          <div
            className={`${dotClass} bg-red-500`}
            title="Negative Sentiment"
          />
        );
      case "CRISIS":
        return (
          <div
            className={`${dotClass} bg-yellow-400 ring-2 ring-yellow-600`}
            title="Crisis Sentiment"
          />
        );
      default:
        return null;
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
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-red-500" /> Moderation Queue
        </h1>
        <p className="text-slate-500 font-medium mt-1">
          Review flagged community forum posts and comments.
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center shadow-sm">
          <ShieldCheck className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-slate-800 mb-2">
            Queue is empty
          </h3>
          <p className="text-slate-500 font-medium">
            There are no pending reports to review. Great job!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report._id}
              className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden flex flex-col md:flex-row"
            >
              {/* Left sidebar info */}
              <div className="bg-red-50/50 p-6 md:w-64 border-b md:border-b-0 md:border-r border-red-100 shrink-0">
                <div className="flex items-center gap-2 mb-4">
                  <Flag className="w-4 h-4 text-red-500" />
                  <span className="text-xs font-black uppercase tracking-wider text-red-700">
                    Flagged {report.contentType}
                  </span>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase">
                      Reason given
                    </div>
                    <div className="font-semibold text-slate-800 mt-0.5">
                      {report.reason}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase">
                      Reported By
                    </div>
                    <div className="font-semibold text-slate-800 mt-0.5">
                      {report.reportedBy?.anonymousAlias || "Unknown"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase">
                      Date
                    </div>
                    <div className="font-semibold text-slate-800 mt-0.5">
                      {format(parseISO(report.createdAt), "MMM d, yyyy h:mm a")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Main content */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Reported Content Preview
                  </div>
                  {report.contentId &&
                    getSentimentDot(report.contentId.sentimentLabel)}
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 relative">
                  {report.contentId ? (
                    <>
                      {report.contentType === "post" && (
                        <h4 className="font-extrabold text-slate-900 mb-2">
                          {report.contentId.title}
                        </h4>
                      )}
                      <p className="text-slate-700 italic font-medium whitespace-pre-wrap">
                        "{report.contentId.content}"
                      </p>
                    </>
                  ) : (
                    <p className="text-slate-400 italic">
                      Content has already been deleted by the user.
                    </p>
                  )}
                </div>

                <div className="mt-auto flex flex-wrap gap-3">
                  <button
                    onClick={() => handleResolve(report._id, "none")}
                    className="flex-1 min-w-[120px] px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve (Ignore)
                  </button>
                  <button
                    onClick={() => handleResolve(report._id, "warned")}
                    className="flex-1 min-w-[120px] px-4 py-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <AlertTriangle className="w-4 h-4" /> Warn User
                  </button>
                  <button
                    onClick={() => handleResolve(report._id, "removed")}
                    className="flex-1 min-w-[120px] px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm shadow-red-600/20"
                  >
                    <Trash2 className="w-4 h-4" /> Remove Content
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminModeration;
