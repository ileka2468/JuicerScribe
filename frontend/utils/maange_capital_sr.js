const { createClient } = require("@supabase/supabase-js");
const { YouTube } = require("youtube-sr");
require("dotenv").config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Constants
const WORKING_CAPITAL_THRESHOLD = 5;
const TARGET_WORKING_CAPITAL_RATIO = 0.8;
const MAX_VIDEOS_PER_BATCH = 10;
const CHECK_INTERVAL = 5000;
const DAYS_TO_LOOK_BACK = 365 * 2;
const SEARCH_STRATEGIES = ["relevance", "date", "rating", "viewCount"];
const PAGE_SIZE = 100;
const MIN_VALUE_THRESHOLD = 0.25; // Dont add videos for less than 25 cents

class VideoManager {
  constructor() {
    this.processedVideoIds = new Set();
    this.lastVideoFetch = null;
    this.isProcessing = false;
    this.currentSearchStrategy = 0;
    this.currentPage = 0;
  }

  getRandomDateRange() {
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * DAYS_TO_LOOK_BACK);
    const endDate = new Date(now - daysAgo * 24 * 60 * 60 * 1000);
    const startDate = new Date(endDate - 30 * 24 * 60 * 60 * 1000);
    return { startDate, endDate };
  }

  async getFinancialStatus() {
    const [baseRate, workingCapital, pendingPayouts] = await Promise.all([
      this.getBaseRate(),
      this.getWorkingCapital(),
      this.getPendingPayouts(),
    ]);

    const availableBalance = workingCapital - pendingPayouts;
    const targetVideoValue = availableBalance * TARGET_WORKING_CAPITAL_RATIO;

    return {
      baseRate,
      workingCapital,
      pendingPayouts,
      availableBalance,
      targetVideoValue,
    };
  }

  async getBaseRate() {
    const { data, error } = await supabase
      .from("payment_config")
      .select("base_rate")
      .eq("id", 1)
      .single();

    if (error) throw error;
    return data.base_rate;
  }

  async getWorkingCapital() {
    const { data, error } = await supabase
      .from("balance")
      .select("working_capital")
      .single();

    if (error) throw error;
    return data.working_capital;
  }

  async getPendingPayouts() {
    const { data, error } = await supabase
      .from("payouts")
      .select("amount")
      .eq("status", "pending");

    if (error) throw error;
    return data.reduce((sum, payout) => sum + payout.amount, 0);
  }

  async getCurrentVideoValue() {
    const baseRate = await this.getBaseRate();
    const { data, error } = await supabase
      .from("videos")
      .select("duration")
      .eq("status", "AVAILABLE");

    if (error) throw error;
    return data.reduce(
      (sum, video) => sum + (video.duration / 30) * baseRate,
      0
    );
  }

  async fetchNewVideos(channelName) {
    if (this.lastVideoFetch && Date.now() - this.lastVideoFetch < 5000) {
      console.log("Skipping fetch - too soon since last fetch");
      return [];
    }

    const searchStrategy = SEARCH_STRATEGIES[this.currentSearchStrategy];
    this.currentSearchStrategy =
      (this.currentSearchStrategy + 1) % SEARCH_STRATEGIES.length;

    const { startDate, endDate } = this.getRandomDateRange();

    console.log(`
          Fetching videos:
          - Strategy: ${searchStrategy}
          - Date Range: ${startDate.toISOString()} to ${endDate.toISOString()}
          - Page Size: ${PAGE_SIZE}
        `);

    try {
      //  multiple search methods to get more variety
      const searchPromises = [
        // Search with date range
        YouTube.search(channelName, {
          limit: PAGE_SIZE,
          type: "video",
          safeSearch: true,
          sortBy: searchStrategy,
          uploadedAfter: startDate,
          uploadedBefore: endDate,
        }),
        // Search without date range
        YouTube.search(channelName, {
          limit: PAGE_SIZE,
          type: "video",
          safeSearch: true,
          sortBy: searchStrategy,
        }),
        // Search with random keywords from common xQc video themes
        YouTube.search(`${channelName} ${this.getRandomKeyword()}`, {
          limit: PAGE_SIZE,
          type: "video",
          safeSearch: true,
        }),
      ];

      const results = await Promise.all(searchPromises);
      const allVideos = results.flat();

      // Deduplicate and shuffle
      const uniqueVideos = [
        ...new Map(allVideos.map((v) => [v.id, v])).values(),
      ];
      const shuffled = uniqueVideos.sort(() => Math.random() - 0.5);

      this.lastVideoFetch = Date.now();

      return shuffled.map((video) => ({
        youtube_id: video.id,
        title: video.title,
        duration: Math.round(video.duration / 1000),
        publishedAt: video.uploadedAt,
      }));
    } catch (error) {
      console.error("Error fetching videos:", error);
      return [];
    }
  }

  getRandomKeyword() {
    const keywords = [
      "react",
      "gameplay",
      "drama",
      "funny",
      "rage",
      "stream highlights",
      "best moments",
      "fails",
      "wins",
      "reactions",
      "drama",
      "controversy",
    ];
    return keywords[Math.floor(Math.random() * keywords.length)];
  }

  calculateVideoCost(duration, baseRate) {
    return (duration / 30) * baseRate;
  }

  async syncVideos(videos, targetValue, baseRate) {
    let addedValue = 0;
    let addedCount = 0;
    const shuffledVideos = videos.sort(() => Math.random() - 0.5);

    for (const video of shuffledVideos) {
      if (addedCount >= MAX_VIDEOS_PER_BATCH) {
        console.log(`Reached batch limit of ${MAX_VIDEOS_PER_BATCH} videos`);
        break;
      }

      if (this.processedVideoIds.has(video.youtube_id)) {
        continue;
      }

      const videoCost = this.calculateVideoCost(video.duration, baseRate);

      if (addedValue + videoCost > targetValue) {
        continue;
      }

      try {
        const { error } = await supabase.from("videos").insert({
          youtube_id: video.youtube_id,
          title: video.title,
          duration: video.duration,
          status: "AVAILABLE",
        });

        if (error) {
          if (!error.message.includes("duplicate key")) {
            console.error(`Error adding video ${video.youtube_id}:`, error);
          }
          continue;
        }

        console.log(
          `Added video: ${video.youtube_id} (Cost: $${videoCost.toFixed(2)})`
        );
        this.processedVideoIds.add(video.youtube_id);
        addedValue += videoCost;
        addedCount++;
      } catch (error) {
        console.error(`Failed to add video ${video.youtube_id}:`, error);
      }
    }

    return addedValue;
  }

  async adjustVideos() {
    if (this.isProcessing) {
      console.log("Already processing, skipping...");
      return;
    }

    this.isProcessing = true;

    try {
      const {
        baseRate,
        workingCapital,
        pendingPayouts,
        availableBalance,
        targetVideoValue,
      } = await this.getFinancialStatus();

      console.log(`
        Working Capital: $${workingCapital.toFixed(2)}
        Pending Payouts: $${pendingPayouts.toFixed(2)}
        Available Balance: $${availableBalance.toFixed(2)}
        Target Video Value: $${targetVideoValue.toFixed(2)}
      `);

      if (availableBalance < WORKING_CAPITAL_THRESHOLD) {
        console.log("Available balance below threshold, skipping adjustment");
        return;
      }

      const currentVideoValue = await this.getCurrentVideoValue();
      console.log(`Current video value: $${currentVideoValue.toFixed(2)}`);

      // Calculate the difference between current and target
      const valueDifference = currentVideoValue - targetVideoValue;

      // If we're within the threshold of the target, no action needed
      if (Math.abs(valueDifference) <= MIN_VALUE_THRESHOLD) {
        console.log(
          `Current value is within threshold of target (±$${MIN_VALUE_THRESHOLD.toFixed(
            2
          )}), no adjustment needed`
        );
        return;
      }

      if (valueDifference > 0) {
        // Need to remove videos
        console.log(
          `Need to remove $${valueDifference.toFixed(2)} worth of videos`
        );
        await this.removeExcessVideos(valueDifference, baseRate);
      } else {
        // Need to add videos
        const valueNeeded = Math.abs(valueDifference);
        console.log(`Need to add $${valueNeeded.toFixed(2)} worth of videos`);

        const videos = await this.fetchNewVideos(
          process.env.YOUTUBE_CHANNEL_NAME
        );

        if (videos.length === 0) {
          console.log("No new videos found to add");
          return;
        }

        const addedValue = await this.syncVideos(videos, valueNeeded, baseRate);
        console.log(`Added $${addedValue.toFixed(2)} worth of new videos`);

        const remainingValue = valueNeeded - addedValue;
        if (remainingValue <= MIN_VALUE_THRESHOLD) {
          console.log(
            `Remaining value ($${remainingValue.toFixed(
              2
            )}) is below threshold, considering target reached`
          );
        }
      }
    } catch (error) {
      console.error("Error in adjustment cycle:", error);
    } finally {
      this.isProcessing = false;
    }
  }

  // removing excess videos
  async removeExcessVideos(excessValue, baseRate) {
    try {
      // Get all available videos ordered by duration (we remove longer videos first to minimize slelection pool volume losses)
      const { data: videos, error } = await supabase
        .from("videos")
        .select("*")
        .eq("status", "AVAILABLE")
        .order("duration", { ascending: false });

      if (error) throw error;

      let removedValue = 0;
      let removedCount = 0;

      for (const video of videos) {
        if (removedValue >= excessValue) break;

        const videoCost = this.calculateVideoCost(video.duration, baseRate);

        // Delete the video
        const { error: deleteError } = await supabase
          .from("videos")
          .delete()
          .eq("id", video.id)
          .eq("status", "AVAILABLE"); // Do NOT delete videos that are CLAIMED, check for AVAILABLE status

        if (deleteError) {
          console.error(`Failed to remove video ${video.id}:`, deleteError);
          continue;
        }

        console.log(
          `Removed video: ${video.youtube_id} (Value: $${videoCost.toFixed(2)})`
        );
        removedValue += videoCost;
        removedCount++;
      }

      console.log(
        `Removed ${removedCount} videos worth $${removedValue.toFixed(2)}`
      );
      return removedValue;
    } catch (error) {
      console.error("Error removing excess videos:", error);
      return 0;
    }
  }
}

// Start the manager
const manager = new VideoManager();

// Add graceful shutdown
process.on("SIGINT", () => {
  console.log("\nGracefully shutting down...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\nGracefully shutting down...");
  process.exit(0);
});

async function mainLoop() {
  while (true) {
    try {
      await manager.adjustVideos();
    } catch (error) {
      console.error("Error in main loop:", error);
    }
    await new Promise((resolve) => setTimeout(resolve, CHECK_INTERVAL));
  }
}

mainLoop();
