import React from "react";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function LinkedAds({ zoneId }) {
  const [linkedAds, setLinkedAds] = useState([]);

  useEffect(() => {
    fetchLinkedAds();
  }, [zoneId]);

  async function fetchLinkedAds() {
    try {
      const { data, error } = await supabase
        .from("ad_assignments")
        .select(
          `
            ads(ad_title, ad_content, target_url, image_url, is_active),
            start_date,
            end_date
          `
        )
        .eq("zone_id", zoneId)
        .is("is_active", true);
      if (error) throw error;
      setLinkedAds(data || []);
    } catch (error) {
      console.error("Failed to fetch linked ads:", error);
    }
  }

  if (linkedAds.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400">
        No ads linked to this zone.
      </p>
    );
  }

  return (
    <div className="mt-2">
      <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200">
        Linked Ads:
      </h4>
      {linkedAds.map((assignment) => (
        <div key={assignment.ads.ad_id} className="ml-4 mt-1">
          <p className="text-gray-700 dark:text-gray-300">
            Title: {assignment.ads.ad_title}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            URL: {assignment.ads.target_url}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Active From: {assignment.start_date} To: {assignment.end_date}
          </p>
        </div>
      ))}
    </div>
  );
}
