import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import YouTube from "react-youtube";

export default function TranscriptionPage() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [video, setVideo] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [transcriptionId, setTranscriptionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [estimatedPayout, setEstimatedPayout] = useState(0);

  useEffect(() => {
    fetchVideoData();
  }, [videoId]);

  async function fetchVideoData() {
    try {
      // Fetch video data and verify ownership
      const { data: videoData, error: videoError } = await supabase
        .from("videos")
        .select("*")
        .eq("id", videoId)
        .eq("claimed_by", user.id)
        .single();

      if (videoError) throw videoError;
      if (!videoData) {
        toast.error("Video not found or not claimed by you");
        navigate("/dashboard");
        return;
      }

      setVideo(videoData);
      setEstimatedPayout((videoData.duration / 30) * 0.5);

      // Fetch existing transcription
      const { data: transcriptionData, error: transcriptionError } =
        await supabase
          .from("transcriptions")
          .select("id, content, status")
          .eq("video_id", videoId)
          .eq("user_id", user.id)
          .single();

      if (transcriptionError && transcriptionError.code !== "PGRST116")
        throw transcriptionError;

      if (transcriptionData) {
        setTranscriptionId(transcriptionData.id);
        setTranscription(transcriptionData.content);

        // If already submitted, show message and redirect
        if (transcriptionData.status === "SUBMITTED") {
          toast.error("This transcription has already been submitted");
          navigate("/dashboard");
          return;
        }
      }

      setLoading(false);
    } catch (error) {
      toast.error("Error loading video data");
      console.error("Error:", error);
      navigate("/dashboard");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!transcription.trim()) {
      toast.error("Please enter a transcription");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.rpc("submit_transcription", {
        transcription_id: transcriptionId,
        transcription_content: transcription,
      });

      if (error) throw error;

      toast.success("Transcription submitted successfully");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to submit transcription. Please try again.");
      setSubmitting(false);
    }
  }

  async function handleSaveDraft() {
    try {
      const { error } = await supabase
        .from("transcriptions")
        .update({ content: transcription })
        .eq("id", transcriptionId)
        .eq("status", "DRAFT");

      if (error) throw error;
      toast.success("Draft saved successfully");
    } catch (error) {
      toast.error("Failed to save draft");
      console.error("Error:", error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-gray-500 dark:text-gray-400">
            Loading video...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {video.title}
          </h1>

          {/* Payout Information */}
          <div className="mb-6 bg-green-50 dark:bg-green-900 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
              Estimated Payout: ${estimatedPayout.toFixed(2)}
            </h2>
            <p className="text-green-700 dark:text-green-300">
              Your transcription will be reviewed for quality. Low-quality
              submissions may be rejected and will need to be redone. Maintain
              high accuracy to ensure approval and payment. Points on the global
              leaderboard are based on transcription quality, video length, and
              how fast you complete the transcription after claming the video.
            </p>
          </div>

          {/* Instructions */}
          <div className="mb-6 bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Transcription Instructions
            </h2>
            <ul className="list-disc list-inside text-blue-700 dark:text-blue-300 space-y-2">
              <li>Only transcribe what xQc says</li>
              <li>Ignore all other voices (donations, videos, other people)</li>
              <li>Use proper punctuation and capitalization</li>
              <li>
                Include verbal expressions and stutters like "uhm", "uh", "dddd
                dud dud" etc.
              </li>
            </ul>
          </div>

          {/* YouTube Video Player */}
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            {" "}
            {/* 16:9 Aspect Ratio */}
            <div className="absolute top-0 left-0 w-full h-full">
              <YouTube
                videoId={video.youtube_id}
                opts={{
                  width: "100%",
                  height: "100%",
                  playerVars: {
                    autoplay: 0,
                    controls: 1,
                  },
                }}
                className="rounded-lg"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                }}
              />
            </div>
          </div>

          {/* Transcription Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label
                htmlFor="transcription"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Enter your transcription
              </label>
              <textarea
                id="transcription"
                rows={10}
                value={transcription}
                onChange={(e) => setTranscription(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 resize-y"
                placeholder="Type what you hear..."
                required
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Word count:{" "}
                {transcription.trim().split(/\s+/).filter(Boolean).length}
              </p>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Save Draft
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Transcription"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
