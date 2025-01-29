import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { v4 as uuidv4 } from "uuid";

export default function Ad({ ad, zoneId }) {
  const { user } = useAuth(); // Fetch the authenticated user from the auth context
  const [ipAddress, setIpAddress] = useState("");
  const [sessionId] = useState(uuidv4()); // Generate a unique session ID once per component mount

  useEffect(() => {
    // Fetch the user's IP address from a public API
    async function fetchIpAddress() {
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        setIpAddress(data.ip);
      } catch (error) {
        console.error("Failed to fetch IP address:", error);
      }
    }
    fetchIpAddress();
  }, []);

  async function handleClick() {
    try {
      await supabase.rpc("log_ad_click", {
        p_ad_id: ad.ad_id,
        p_zone_id: zoneId,
        p_session_id: sessionId,
        p_ip_address: ipAddress || "unknown", // Default to "unknown" if IP is unavailable
        p_referrer: document.referrer || "direct", // Default to "direct" if no referrer is present
        p_user_id: user ? user.id : null, // Use the authenticated user's ID if available
      });
    } catch (error) {
      console.error("Ad click logging failed:", error);
    } finally {
      window.open(ad.target_url, "_blank");
    }
  }

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-lg transition-shadow flex flex-col"
    >
      {ad.image_url && (
        <div className="w-full flex justify-center items-center mb-4">
          <img
            src={ad.image_url}
            alt={ad.ad_title}
            className="max-w-full max-h-48 object-contain rounded-md"
            loading="lazy"
          />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {ad.ad_title}
      </h3>
      <p className="text-gray-700 dark:text-gray-200 flex-grow line-clamp-3">
        {ad.ad_content}
      </p>
      <div className="mt-4">
        <a
          href={ad.target_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 dark:text-indigo-400 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          Learn More
        </a>
      </div>
    </div>
  );
}
