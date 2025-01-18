import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import SupportSection from "../components/SupportSection";

export default function AdminDashboard() {
  const [videos, setVideos] = useState([]);
  const [transcriptions, setTranscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newVideo, setNewVideo] = useState({
    youtube_id: "",
    title: "",
    duration: "",
  });
  const [baseRate, setBaseRate] = useState("0.50");
  const [updatingRate, setUpdatingRate] = useState(false);
  const [processingPayment, setProcessingPayment] = useState({});
  const [activeTab, setActiveTab] = useState("videos");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      // Fetch all videos
      const { data: videosData, error: videosError } = await supabase
        .from("videos")
        .select("*")
        .order("created_at", { ascending: false });

      if (videosError) throw videosError;
      setVideos(videosData);

      // Fetch pending transcriptions
      const { data: transcriptionsData, error: transcriptionsError } =
        await supabase
          .from("transcriptions")
          .select(
            `
            *,
            videos (*),
            profiles (username)
          `
          )
          .eq("status", "SUBMITTED")
          .order("created_at", { ascending: false });

      if (transcriptionsError) throw transcriptionsError;
      setTranscriptions(transcriptionsData);

      // Fetch current base rate
      const { data: rateData, error: rateError } = await supabase
        .from("payment_config")
        .select("base_rate")
        .single();

      if (rateError) throw rateError;
      setBaseRate(rateData.base_rate.toString());

      setLoading(false);
    } catch (error) {
      toast.error("Error loading dashboard data");
      console.error("Error:", error);
      setLoading(false);
    }
  }

  async function handleAddVideo(e) {
    e.preventDefault();
    try {
      const { error } = await supabase.from("videos").insert([
        {
          youtube_id: newVideo.youtube_id,
          title: newVideo.title,
          duration: parseInt(newVideo.duration),
          status: "AVAILABLE",
        },
      ]);

      if (error) throw error;

      toast.success("Video added successfully");
      setNewVideo({ youtube_id: "", title: "", duration: "" });
      fetchDashboardData();
    } catch (error) {
      toast.error("Failed to add video");
      console.error("Error:", error);
    }
  }

  async function handleUpdateBaseRate(e) {
    e.preventDefault();
    setUpdatingRate(true);
    try {
      const numericRate = parseFloat(baseRate);
      if (isNaN(numericRate) || numericRate < 0) {
        throw new Error("Please enter a valid positive number");
      }

      const { error } = await supabase
        .from("payment_config")
        .update({ base_rate: numericRate })
        .eq("id", 1);

      if (error) throw error;
      toast.success("Base rate updated successfully");
    } catch (error) {
      toast.error(error.message || "Failed to update base rate");
      console.error("Error:", error);
    } finally {
      setUpdatingRate(false);
    }
  }

  async function handleTranscriptionReview(
    transcriptionId,
    status,
    qualityScore = null,
    feedback = ""
  ) {
    // Set processing state for this specific transcription
    setProcessingPayment((prev) => ({ ...prev, [transcriptionId]: true }));

    try {
      // Validate quality score for approvals
      if (status === "APPROVED") {
        if (qualityScore === null) {
          qualityScore = parseInt(prompt("Enter quality score (0-100):", "90"));
        }
        if (isNaN(qualityScore) || qualityScore < 0 || qualityScore > 100) {
          toast.error("Quality score must be between 0 and 100");
          return;
        }
      }

      // Get feedback for rejections
      if (status === "REJECTED" && !feedback) {
        feedback = prompt("Enter feedback for rejection:");
        if (!feedback) {
          toast.error("Feedback is required for rejections");
          return;
        }
      }

      // First review the transcription
      const { error: reviewError } = await supabase.rpc(
        "review_transcription",
        {
          p_transcription_id: transcriptionId,
          p_status: status,
          p_feedback: feedback,
          p_quality_score: qualityScore,
        }
      );

      if (reviewError) throw reviewError;

      // If approved, process the payment
      if (status === "APPROVED") {
        const session = await supabase.auth.getSession();
        const accessToken = session.data.session?.access_token;

        if (!accessToken) {
          throw new Error("No access token available");
        }

        const { data: transferData, error: transferError } =
          await supabase.functions.invoke("process-transfer", {
            body: { transcription_id: transcriptionId },
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

        if (transferError) throw transferError;

        if (!transferData?.success) {
          throw new Error("Transfer failed");
        }

        toast.success(
          `Transcription approved and payment of $${transferData.amount} processed`
        );
      } else {
        toast.success(`Transcription ${status.toLowerCase()}`);
      }

      // Refresh the dashboard data
      await fetchDashboardData();
    } catch (error) {
      console.error("Review error:", error);
      toast.error(
        error.message || "Failed to process transcription. Please try again."
      );
    } finally {
      // Clear processing state for this transcription
      setProcessingPayment((prev) => {
        const newState = { ...prev };
        delete newState[transcriptionId];
        return newState;
      });
    }
  }

  async function toggleVideoStatus(videoId, currentStatus) {
    try {
      const newStatus =
        currentStatus === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE";
      const { error } = await supabase
        .from("videos")
        .update({ status: newStatus })
        .eq("id", videoId);

      if (error) throw error;

      toast.success("Video status updated");
      fetchDashboardData();
    } catch (error) {
      toast.error("Failed to update video status");
      console.error("Error:", error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-gray-500 dark:text-gray-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("videos")}
              className={`${
                activeTab === "videos"
                  ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium`}
            >
              Videos & Transcriptions
            </button>
            <button
              onClick={() => setActiveTab("support")}
              className={`${
                activeTab === "support"
                  ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium`}
            >
              Support Tickets
            </button>
          </nav>
        </div>

        {activeTab === "videos" ? (
          <>
            {/* Payment Configuration Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Payment Configuration
              </h2>
              <form onSubmit={handleUpdateBaseRate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Base Rate ($ per 30 seconds)
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 dark:text-gray-400">
                          $
                        </span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={baseRate}
                        onChange={(e) => setBaseRate(e.target.value)}
                        className="pl-7 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={updatingRate}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                  {updatingRate ? "Updating..." : "Update Base Rate"}
                </button>
              </form>
            </div>

            {/* Add New Video Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Add New Video
              </h2>
              <form onSubmit={handleAddVideo} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    YouTube ID
                    <input
                      type="text"
                      value={newVideo.youtube_id}
                      onChange={(e) =>
                        setNewVideo({ ...newVideo, youtube_id: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Title
                    <input
                      type="text"
                      value={newVideo.title}
                      onChange={(e) =>
                        setNewVideo({ ...newVideo, title: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Duration (seconds)
                    <input
                      type="number"
                      value={newVideo.duration}
                      onChange={(e) =>
                        setNewVideo({ ...newVideo, duration: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                  Add Video
                </button>
              </form>
            </div>

            {/* Video Management Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Video Management
              </h2>
              <div className="space-y-4">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className="border dark:border-gray-700 rounded p-4 flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {video.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Duration: {Math.floor(video.duration / 60)}m{" "}
                        {video.duration % 60}s
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Status: {video.status}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleVideoStatus(video.id, video.status)}
                      disabled={
                        video.status !== "AVAILABLE" &&
                        video.status !== "UNAVAILABLE"
                      }
                      className={`px-4 py-2 rounded ${
                        video.status === "AVAILABLE"
                          ? "bg-red-600 hover:bg-red-700"
                          : video.status === "UNAVAILABLE"
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-gray-400 cursor-not-allowed"
                      } text-white disabled:opacity-50`}
                    >
                      {video.status === "AVAILABLE"
                        ? "Disable"
                        : video.status === "UNAVAILABLE"
                        ? "Enable"
                        : video.status === "CLAIMED"
                        ? "Claimed"
                        : "Completed"}
                    </button>
                  </div>
                ))}
                {videos.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400">
                    No videos available.
                  </p>
                )}
              </div>
            </div>

            {/* Transcription Review Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Pending Transcriptions
              </h2>
              <div className="space-y-6">
                {transcriptions.map((transcription) => (
                  <div
                    key={transcription.id}
                    className="border dark:border-gray-700 rounded p-4"
                  >
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {transcription.videos.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Submitted by: {transcription.profiles.username}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Estimated Payout: $
                        {transcription.estimated_payout?.toFixed(2)}
                      </p>
                    </div>
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        Transcription:
                      </h4>
                      <p className="bg-gray-50 dark:bg-gray-700 p-3 rounded text-gray-900 dark:text-gray-300">
                        {transcription.content}
                      </p>
                    </div>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => {
                          const qualityScore = parseInt(
                            prompt("Enter quality score (0-100):", "90")
                          );
                          if (
                            !isNaN(qualityScore) &&
                            qualityScore >= 0 &&
                            qualityScore <= 100
                          ) {
                            handleTranscriptionReview(
                              transcription.id,
                              "APPROVED",
                              qualityScore
                            );
                          } else {
                            toast.error(
                              "Please enter a valid quality score between 0 and 100"
                            );
                          }
                        }}
                        disabled={processingPayment[transcription.id]}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        {processingPayment[transcription.id]
                          ? "Processing..."
                          : "Approve"}
                      </button>
                      <button
                        onClick={() => {
                          const feedback = prompt(
                            "Enter feedback for rejection:"
                          );
                          if (feedback) {
                            handleTranscriptionReview(
                              transcription.id,
                              "REJECTED",
                              null,
                              feedback
                            );
                          }
                        }}
                        disabled={processingPayment[transcription.id]}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
                {transcriptions.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400">
                    No pending transcriptions to review.
                  </p>
                )}
              </div>
            </div>
          </>
        ) : (
          <SupportSection />
        )}
      </div>
    </div>
  );
}
