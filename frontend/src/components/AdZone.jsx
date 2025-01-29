import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Ad from "./Ad";

export default function AdZone({ zoneName, containerTypeProp = "vertical" }) {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [containerType, setContainerType] = useState(containerTypeProp);
  const [zoneId, setZoneId] = useState(null);

  useEffect(() => {
    fetchZoneAds();
  }, [zoneName]);

  async function fetchZoneAds() {
    try {
      // Fetch from renderable_zones by zone name
      const { data: zoneRows, error: zoneError } = await supabase
        .from("renderable_zones")
        .select("zone_id, zone_name, container_type, ad_id")
        .eq("zone_name", zoneName);

      if (zoneError) throw zoneError;
      if (!zoneRows || zoneRows.length === 0) {
        setLoading(false);
        return;
      }

      // Use the first row's container_type
      setContainerType(zoneRows[0].container_type);
      // Save the zoneId so we can pass it to the Ad component
      setZoneId(zoneRows[0].zone_id);

      // Collect all ad_ids from these rows
      const adIds = zoneRows.map((row) => row.ad_id);

      // Fetch details from active_ads
      const { data: activeAds, error: adsError } = await supabase
        .from("active_ads")
        .select("ad_id, ad_title, ad_content, target_url, image_url")
        .in("ad_id", adIds);

      if (adsError) throw adsError;
      setAds(activeAds || []);
    } catch (error) {
      console.error("AdZone Error:", error);
    } finally {
      setLoading(false);
    }
  }

  const layoutStyles = {
    vertical: "flex flex-col space-y-4",
    horizontal: "flex flex-row space-x-4",
    grid: "grid grid-cols-2 gap-4 md:grid-cols-3",
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
        <p className="text-gray-500 dark:text-gray-300">Loading ads...</p>
      </div>
    );
  }

  return (
    <div
      className={`my-4 ${layoutStyles[containerType] || layoutStyles.vertical} 
        max-w-lg mx-auto px-4`}
    >
      {ads.map((ad) => (
        <Ad key={ad.ad_id} ad={ad} zoneId={zoneId} />
      ))}
    </div>
  );
}
