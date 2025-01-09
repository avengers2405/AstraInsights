"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Database,
  Share2,
  MessageSquare,
  PlayCircle,
  Image,
  Layout,
  Upload,
  FileIcon,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EngagementMetric {
  icon: React.ElementType;
  label: string;
  stat: string;
  detail: string;
}

interface Tool {
  name: string;
  description: string;
}

interface EngagementData {
  date: string;
  likes: number;
  comments: number;
  shares: number;
  postType: string;
}

const LandingPage = () => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");

  // Sample engagement data
  const sampleData: EngagementData[] = [
    {
      date: "2024-01-01",
      likes: 1200,
      comments: 450,
      shares: 200,
      postType: "Carousel",
    },
    {
      date: "2024-01-02",
      likes: 800,
      comments: 300,
      shares: 150,
      postType: "Static",
    },
    {
      date: "2024-01-03",
      likes: 2000,
      comments: 900,
      shares: 400,
      postType: "Reel",
    },
    {
      date: "2024-01-04",
      likes: 1500,
      comments: 600,
      shares: 250,
      postType: "Carousel",
    },
    {
      date: "2024-01-05",
      likes: 1800,
      comments: 750,
      shares: 300,
      postType: "Reel",
    },
  ];

  const engagementMetrics: EngagementMetric[] = [
    {
      icon: Layout,
      label: "Carousel Posts",
      stat: "+20%",
      detail: "higher engagement than static posts",
    },
    {
      icon: PlayCircle,
      label: "Reels",
      stat: "2x",
      detail: "more comments than other formats",
    },
    {
      icon: Image,
      label: "Static Posts",
      stat: "Baseline",
      detail: "for comparison metrics",
    },
  ];

  const tools: Tool[] = [
    {
      name: "DataStax Astra DB",
      description: "Robust database operations for social media analytics",
    },
    {
      name: "Langflow",
      description:
        "Workflow creation and GPT integration for advanced insights",
    },
  ];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const validateFile = (file: File): boolean => {
    const validTypes = ["text/csv", "application/json"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a CSV or JSON file");
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File size should be less than 5MB");
      return false;
    }
    return true;
  };

  const uploadFile = async (file: File) => {
    setUploadStatus("uploading");
    const formData = new FormData();
    formData.append("file", file);

    try {

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/upload`, {

        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      setUploadStatus("success");
      localStorage.setItem("currentCollection", data.collection);
      router.push("/chat");
    } catch (error) {
      setUploadStatus("error");
      setError("Failed to upload file");
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError("");

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile);
      uploadFile(droppedFile);
    }
  }, []);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const selectedFile = e.target.files?.[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
      await uploadFile(selectedFile);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white">
      <div
        className={`container mx-auto px-4 py-16 transition-all duration-1000 transform ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      >
        <nav className="flex justify-between items-center mb-16">
          <h1 className="text-3xl font-bold">AstraInsights</h1>
        </nav>

        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Social Media Performance Analysis
          </h2>
          <p className="text-lg lg:text-xl text-purple-200 max-w-2xl mx-auto mb-8">
            Pre-Hackathon Assignment: Build a powerful analytics module using
            cutting-edge tools to analyze social media engagement data.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
            <button
              onClick={() => setIsUploadDialogOpen(true)}
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 px-6 py-3 rounded-full transition-colors flex items-center justify-center gap-2"
            >
              <Upload size={20} />
              Upload Your Dataset
            </button>
            <button onClick={() => router.push("/chat")} className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-full transition-colors">
              Use Sample Dataset
            </button>
          </div>

          <div className="text-center mb-8">
            <p className="text-sm lg:text-base text-purple-300">
              <span className="font-semibold">Note:</span> You can either use
              our pre-loaded sample dataset to explore the features or upload
              your own CSV file containing social media engagement metrics.
            </p>
          </div>
        </div>

        {/* Upload Dialog */}
        <Dialog
          open={isUploadDialogOpen}
          onOpenChange={() => {
            setIsUploadDialogOpen(false);
            setFile(null);
            setError("");
            setUploadStatus("idle");
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Dataset</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div
                onDragEnter={handleDragEnter}
                onDragOver={(e) => e.preventDefault()}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  relative rounded-lg border-2 border-dashed p-8 transition-all duration-200
                  ${
                    isDragging
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-gray-300/20"
                  }
                  ${
                    uploadStatus === "success"
                      ? "border-green-500/50 bg-green-500/10"
                      : ""
                  }
                  ${
                    uploadStatus === "error"
                      ? "border-red-500/50 bg-red-500/10"
                      : ""
                  }
                `}
              >
                <input
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center gap-4 text-center">
                  {!file ? (
                    <>
                      <div className="rounded-full bg-purple-500/10 p-4">
                        <Upload className="h-6 w-6 text-purple-500" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">
                          Drag and drop your file here or click to browse
                        </p>
                        <p className="text-xs text-gray-400">
                          Supports CSV and JSON files (max 5MB)
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-4">
                      <FileIcon className="h-8 w-8 text-purple-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      {uploadStatus === "success" && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <p>{error}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Sample Data Visualization */}
        <div className="bg-white/5 backdrop-blur-lg p-4 lg:p-6 rounded-xl mb-20">
          <h3 className="text-xl font-semibold mb-4">
            Sample Engagement Metrics
          </h3>
          <div className="h-64 lg:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sampleData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis
                  dataKey="date"
                  stroke="#fff"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.split("-").slice(1).join("/")}
                />
                <YAxis stroke="#fff" tick={{ fontSize: 12 }} width={45} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #333",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="likes"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="comments"
                  stroke="#06b6d4"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="shares"
                  stroke="#10b981"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {engagementMetrics.map((metric, index) => (
            <div
              key={metric.label}
              className={`bg-white/5 backdrop-blur-lg p-6 rounded-xl text-center transition-all duration-500 transform hover:scale-105 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <metric.icon className="w-12 h-12 mx-auto mb-4 text-purple-400" />
              <h3 className="text-xl font-semibold mb-2">{metric.label}</h3>
              <p className="text-4xl font-bold text-purple-400 mb-2">
                {metric.stat}
              </p>
              <p className="text-sm text-purple-200">{metric.detail}</p>
            </div>
          ))}
        </div>

        {/* Task Details */}
        <div
          className={`bg-white/5 backdrop-blur-lg p-8 rounded-xl mb-20 transition-all duration-1000 transform ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <h3 className="text-2xl font-semibold mb-6">Task Details</h3>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Database className="w-6 h-6 text-purple-400 mt-1" />
              <div>
                <h4 className="font-semibold mb-2">Fetch Engagement Data</h4>
                <p className="text-purple-200">
                  Create and store simulated social media engagement data in
                  DataStax Astra DB.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Share2 className="w-6 h-6 text-purple-400 mt-1" />
              <div>
                <h4 className="font-semibold mb-2">Analyze Post Performance</h4>
                <p className="text-purple-200">
                  Build a Langflow workflow to analyze engagement metrics across
                  different post types.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <MessageSquare className="w-6 h-6 text-purple-400 mt-1" />
              <div>
                <h4 className="font-semibold mb-2">Provide Insights</h4>
                <p className="text-purple-200">
                  Leverage GPT integration to generate actionable insights from
                  the analyzed data.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-purple-200">
          <p>Ready to start your analysis journey?</p>
          <button className="mt-4 bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-full transition-colors">
            Begin Assignment
          </button>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
