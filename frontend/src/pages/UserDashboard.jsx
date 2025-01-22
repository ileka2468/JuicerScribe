import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [availableVideos, setAvailableVideos] = useState([]);
  const [claimedVideos, setClaimedVideos] = useState([]);
  const [reviewVideos, setReviewVideos] = useState([]);
  const [completedVideos, setCompletedVideos] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [earnings, setEarnings] = useState({
    pending: 0,
    approved: 0,
    paid: 0,
  });
  const [loading, setLoading] = useState(true);
  const [availableSort, setAvailableSort] = useState("date");
  const [completedSort, setCompletedSort] = useState("date");
  const [completedFilter, setCompletedFilter] = useState("all");

  useEffect(() => {
    fetchDashboardData();
  }, [availableSort, completedSort, completedFilter]);

  async function fetchDashboardData() {
    try {
      // Fetch available videos with sorting
      let availableQuery = supabase
        .from("videos")
        .select("*")
        .eq("status", "AVAILABLE")
        .is("claimed_by", null);

      // Apply sorting to available videos
      switch (availableSort) {
        case "duration":
          availableQuery = availableQuery.order("duration", {
            ascending: false,
          });
          break;
        case "payout":
          availableQuery = availableQuery.order("duration", {
            ascending: false,
          });
          break;
        case "title":
          availableQuery = availableQuery.order("title");
          break;
        default: // date
          availableQuery = availableQuery.order("created_at", {
            ascending: false,
          });
      }

      const { data: availableData, error: availableError } =
        await availableQuery;
      if (availableError) throw availableError;
      setAvailableVideos(availableData || []);

      // Fetch user's claimed videos
      const { data: claimedData, error: claimedError } = await supabase
        .from("videos")
        .select(
          `
          *,
          transcriptions!inner(*)
        `
        )
        .eq("claimed_by", user.id)
        .eq("status", "CLAIMED")
        .eq("transcriptions.user_id", user.id);

      if (claimedError) throw claimedError;
      setClaimedVideos(claimedData || []);

      // Fetch completed transcriptions with filtering and sorting
      let completedQuery = supabase
        .from("transcriptions")
        .select(
          `
          *,
          videos (*)
        `
        )
        .eq("user_id", user.id);

      // Apply status filter
      if (completedFilter === "approved") {
        completedQuery = completedQuery.eq("status", "APPROVED");
      } else if (completedFilter === "rejected") {
        completedQuery = completedQuery.eq("status", "REJECTED");
      } else {
        completedQuery = completedQuery.in("status", ["APPROVED", "REJECTED"]);
      }

      // Apply sorting to completed transcriptions
      switch (completedSort) {
        case "payout":
          completedQuery = completedQuery.order("actual_payout", {
            ascending: false,
          });
          break;
        case "title":
          completedQuery = completedQuery.order("videos.title");
          break;
        default: // date
          completedQuery = completedQuery.order("created_at", {
            ascending: false,
          });
      }

      const { data: completedData, error: completedError } =
        await completedQuery;
      if (completedError) throw completedError;
      setCompletedVideos(completedData || []);

      // Fetch transcriptions under review
      const { data: transcriptionsData, error: transcriptionsError } =
        await supabase
          .from("transcriptions")
          .select("id, content, status, created_at, estimated_payout, video_id")
          .eq("user_id", user.id)
          .eq("status", "SUBMITTED");

      if (transcriptionsError) throw transcriptionsError;

      if (transcriptionsData && transcriptionsData.length > 0) {
        const videoIds = transcriptionsData.map((t) => t.video_id);
        const { data: videosData, error: videosError } = await supabase
          .from("videos")
          .select("id, title, youtube_id, duration")
          .in("id", videoIds);

        if (videosError) throw videosError;

        const reviewData = transcriptionsData.map((transcription) => ({
          ...transcription,
          video: videosData?.find((v) => v.id === transcription.video_id),
        }));

        setReviewVideos(reviewData);
      } else {
        setReviewVideos([]);
      }

      // Fetch earnings data
      const { data: earningsData, error: earningsError } = await supabase
        .from("transcriptions")
        .select("estimated_payout, actual_payout, payment_status")
        .eq("user_id", user.id);

      if (earningsError) throw earningsError;

      const earnings = (earningsData || []).reduce(
        (acc, curr) => {
          if (curr.payment_status === "PENDING") {
            acc.pending += curr.estimated_payout || 0;
          } else if (curr.payment_status === "APPROVED") {
            acc.approved += curr.actual_payout || 0;
          } else if (curr.payment_status === "PAID") {
            acc.paid += curr.actual_payout || 0;
          }
          return acc;
        },
        { pending: 0, approved: 0, paid: 0 }
      );

      setEarnings(earnings);

      // Fetch leaderboard
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from("profiles")
        .select("username, points")
        .order("points", { ascending: false })
        .limit(10);

      if (leaderboardError) throw leaderboardError;
      setLeaderboard(leaderboardData || []);

      setLoading(false);
    } catch (error) {
      toast.error("Error loading dashboard data");
      console.error("Error:", error);
      setLoading(false);
    }
  }

  async function handleClaimVideo(videoId) {
    try {
      // First check if user has a completed Stripe account
      const { data: stripeAccount, error: stripeError } = await supabase
        .from("stripe_accounts")
        .select("charges_enabled")
        .eq("user_id", user.id)
        .single();

      if (stripeError && stripeError.code !== "PGRST116") throw stripeError;

      if (!stripeAccount || !stripeAccount.charges_enabled) {
        toast.error(
          <>
            Please complete your payment account setup before claiming videos to
            transcribe.{" "}
            <Link
              to="/payments"
              style={{ textDecoration: "underline", color: "blue" }}
            >
              Setup Account
            </Link>
          </>,
          {
            duration: 5000,
          }
        );
        return;
      }

      // First update video status
      const { error: videoError } = await supabase
        .from("videos")
        .update({
          status: "CLAIMED",
          claimed_by: user.id,
        })
        .eq("id", videoId)
        .eq("status", "AVAILABLE")
        .is("claimed_by", null);

      if (videoError) throw videoError;

      // Then create a draft transcription entry
      const { error: transcriptionError } = await supabase
        .from("transcriptions")
        .insert([
          {
            video_id: videoId,
            user_id: user.id,
            content: "",
            status: "DRAFT",
          },
        ]);

      if (transcriptionError) throw transcriptionError;

      // Navigate to transcription page
      navigate(`/transcribe/${videoId}`);
      toast.success("Video claimed successfully!");
    } catch (error) {
      toast.error("Failed to claim video");
      console.error("Error:", error);
      // If transcription creation failed, try to rollback the video claim
      if (error.message.includes("transcriptions")) {
        await supabase
          .from("videos")
          .update({
            status: "AVAILABLE",
            claimed_by: null,
          })
          .eq("id", videoId);
      }
    }
  }

  const getYouTubeThumbnail = (youtubeId) => {
    return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
  };

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
      <div className="max-w-[1400px] mx-auto">
        {/* Earnings Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Earnings Dashboard
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Pending Earnings
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                  ${earnings.pending.toFixed(2)}
                </dd>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Approved Earnings
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                  ${earnings.approved.toFixed(2)}
                </dd>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Total Paid
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                  ${earnings.paid.toFixed(2)}
                </dd>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Next Payout
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                  ${earnings.approved.toFixed(2)}
                </dd>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Processed Daily
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Available Videos Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            {/* Remove flex & justify-between, and optionally add some margin or spacing here */}
            <div className="p-6 pb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Available Videos
              </h2>
              <select
                value={availableSort}
                onChange={(e) => setAvailableSort(e.target.value)}
                className="mt-2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm 
                 focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="date">Date Added</option>
                <option value="duration">Duration</option>
                <option value="payout">Estimated Payout</option>
                <option value="title">Title</option>
              </select>
            </div>

            <div className="px-6 h-[600px] overflow-y-auto pr-0">
              <div className="space-y-4 pr-6">
                {availableVideos.map((video) => (
                  <div
                    key={video.id}
                    className="border dark:border-gray-700 rounded p-4"
                  >
                    <div className="aspect-video mb-3">
                      <img
                        src={getYouTubeThumbnail(video.youtube_id)}
                        alt={video.title}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {video.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Duration: {Math.floor(video.duration / 60)}m{" "}
                      {video.duration % 60}s
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-2">
                      Estimated: ${((video.duration / 30) * 0.5).toFixed(2)}
                    </p>
                    <button
                      onClick={() => handleClaimVideo(video.id)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                    >
                      Claim Video
                    </button>
                  </div>
                ))}
                {availableVideos.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400">
                    No videos available for transcription.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Claimed Videos Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 pb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Your Claimed Videos
              </h2>
            </div>
            <div className="px-6 h-[600px] overflow-y-auto pr-0">
              <div className="space-y-4 pr-6">
                {claimedVideos.map((video) => (
                  <div
                    key={video.id}
                    className="border dark:border-gray-700 rounded p-4"
                  >
                    <div className="aspect-video mb-3">
                      <img
                        src={getYouTubeThumbnail(video.youtube_id)}
                        alt={video.title}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {video.title}
                    </h3>
                    <button
                      onClick={() => navigate(`/transcribe/${video.id}`)}
                      className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Continue Transcription
                    </button>
                  </div>
                ))}
                {claimedVideos.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400">
                    You haven't claimed any videos yet.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Videos Under Review Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 pb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Under Review
              </h2>
            </div>
            <div className="px-6 h-[600px] overflow-y-auto pr-0">
              <div className="space-y-4 pr-6">
                {reviewVideos.map((transcription) => (
                  <div
                    key={transcription.id}
                    className="border dark:border-gray-700 rounded p-4"
                  >
                    {transcription.video?.youtube_id && (
                      <div className="aspect-video mb-3">
                        <img
                          src={getYouTubeThumbnail(
                            transcription.video.youtube_id
                          )}
                          alt={transcription.video?.title}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                    )}
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {transcription.video?.title || "Video Unavailable"}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Submitted:{" "}
                      {new Date(transcription.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                      Estimated: $
                      {(transcription.estimated_payout || 0).toFixed(2)}
                    </p>
                  </div>
                ))}
                {reviewVideos.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400">
                    No videos under review.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Historical Transcriptions Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow lg:col-span-2">
            <div className="p-6 pb-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Transcription History
              </h2>
              <div className="flex space-x-4">
                <select
                  value={completedFilter}
                  onChange={(e) => setCompletedFilter(e.target.value)}
                  className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <select
                  value={completedSort}
                  onChange={(e) => setCompletedSort(e.target.value)}
                  className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="date">Date</option>
                  <option value="payout">Payout</option>
                  <option value="title">Title</option>
                </select>
              </div>
            </div>
            <div className="px-6 h-[600px] overflow-y-auto pr-0">
              <div className="space-y-4 pr-6">
                {completedVideos.map((transcription) => (
                  <div
                    key={transcription.id}
                    className="border dark:border-gray-700 rounded p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {transcription.videos?.title || "Video Unavailable"}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Completed:{" "}
                          {new Date(
                            transcription.created_at
                          ).toLocaleDateString()}
                        </p>
                        {transcription.status === "APPROVED" && (
                          <p className="text-sm text-green-600 dark:text-green-400">
                            Earned: $
                            {(transcription.actual_payout || 0).toFixed(2)}
                          </p>
                        )}
                        {transcription.status === "REJECTED" &&
                          transcription.feedback && (
                            <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                              Feedback: {transcription.feedback}
                            </p>
                          )}
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                          transcription.status === "APPROVED"
                            ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                            : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                        }`}
                      >
                        {transcription.status}
                      </span>
                    </div>
                  </div>
                ))}
                {completedVideos.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400">
                    No completed transcriptions yet.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Leaderboard Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 pb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Leaderboard
              </h2>
            </div>
            <div className="px-6 h-[600px] overflow-y-auto pr-0">
              <div className="space-y-2 pr-6">
                {leaderboard.map((profile, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded"
                  >
                    <span className="font-medium text-gray-900 dark:text-white">
                      {index + 1}. {profile.username || "Anonymous"}
                    </span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                      {profile.points || 0} points
                    </span>
                  </div>
                ))}
                {leaderboard.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400">
                    No users on the leaderboard yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
