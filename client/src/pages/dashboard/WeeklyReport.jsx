import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { toast } from "react-hot-toast";
import {
  Loader2,
  FileText,
  AlertTriangle,
  Sparkles,
  Calendar,
  RefreshCw,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

const WeeklyReport = () => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/wellness-reports");
      setReports(res.data.data);
      if (res.data.data.length > 0) {
        setSelectedReport(res.data.data[0]);
      }
    } catch (error) {
      toast.error("Could not fetch wellness reports.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerateNow = async () => {
    setIsGenerating(true);
    toast.loading("Generating your new wellness report...", {
      id: "generating-report",
    });
    try {
      const res = await api.post("/wellness-reports/generate");
      toast.success("New report generated!", { id: "generating-report" });
      // Refetch reports to get the new one
      await fetchReports();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to generate report.", {
        id: "generating-report",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectReport = (reportId) => {
    const report = reports.find((r) => r._id === reportId);
    setSelectedReport(report);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 bg-white rounded-lg shadow">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <p className="ml-4 text-gray-600">Loading your reports...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <div className="flex justify-between items-center mb-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-800">
            Your Weekly Wellness Report
          </h2>
        </div>
        <div className="flex items-center gap-4">
          {reports.length > 0 && (
            <select
              onChange={(e) => handleSelectReport(e.target.value)}
              value={selectedReport?._id || ""}
              className="p-2 border border-gray-300 rounded-lg"
            >
              {reports.map((report) => (
                <option key={report._id} value={report._id}>
                  Week of {formatDate(report.weekStartDate)}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={handleGenerateNow}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-purple-300 transition-colors"
          >
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <RefreshCw size={18} />
            )}
            Generate Now
          </button>
        </div>
      </div>

      {reports.length === 0 && !isLoading ? (
        <div className="text-center py-10 px-6 bg-gray-50 rounded-lg">
          <Sparkles className="w-12 h-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-800">
            No Reports Yet
          </h3>
          <p className="mt-2 text-gray-500">
            There's not enough activity from the past week to generate a report.
            <br />
            Try tracking your mood, habits, and journal entries to get your
            first summary next week!
          </p>
        </div>
      ) : (
        selectedReport && (
          <div className="animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={18} />
                <span className="font-semibold">
                  Report for the week of{" "}
                  {formatDate(selectedReport.weekStartDate)} to{" "}
                  {formatDate(selectedReport.weekEndDate)}
                </span>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                Generated on {formatDate(selectedReport.generatedAt)}
              </span>
            </div>
            <div className="prose prose-purple max-w-none p-5 bg-slate-50 rounded-xl">
              <ReactMarkdown>{selectedReport.reportContent}</ReactMarkdown>
            </div>
            <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded-r-lg">
              <div className="flex">
                <div className="py-1">
                  <AlertTriangle size={20} className="mr-3" />
                </div>
                <div>
                  <p className="font-bold">Disclaimer</p>
                  <p className="text-sm">
                    This report is generated by an AI and is for informational
                    purposes only. It is not a substitute for professional
                    medical advice, diagnosis, or treatment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default WeeklyReport;
