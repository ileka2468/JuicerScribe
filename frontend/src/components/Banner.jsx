import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./css/Banner.css";

export default function Banner() {
  const [bannerContent, setBannerContent] = useState("");
  const [animationDuration, setAnimationDuration] = useState("0s"); // Initialize to 0
  const location = useLocation();
  const marqueeRef = useRef(null);

  const SCROLL_SPEED = 200; // pixels per second

  useEffect(() => {
    async function fetchBanner() {
      try {
        // Fetch the "all" endpoint banner
        const { data: allBanner, error: allError } = await supabase
          .from("banners")
          .select("content")
          .eq("endpoint", "all")
          .eq("enabled", true)
          .single();

        if (allError && allError.code !== "PGRST116") throw allError;

        if (allBanner) {
          setBannerContent(allBanner.content);
          return;
        }

        // Fetch the page-specific banner
        const { data: pageBanner, error: pageError } = await supabase
          .from("banners")
          .select("content")
          .eq("endpoint", location.pathname.replace("/", ""))
          .eq("enabled", true)
          .single();

        if (pageError && pageError.code !== "PGRST116") throw pageError;

        if (pageBanner) {
          setBannerContent(pageBanner.content);
        } else {
          setBannerContent("");
        }
      } catch (error) {
        console.error("Error fetching banner:", error);
        setBannerContent("");
      }
    }

    fetchBanner();
  }, [location]);

  useEffect(() => {
    if (!bannerContent || !marqueeRef.current) return;

    const handleResize = () => {
      const marqueeWidth = marqueeRef.current.scrollWidth;
      const containerWidth = marqueeRef.current.parentElement.offsetWidth;

      // Total distance to scroll is the width of the marquee content plus the container width
      const totalDistance = marqueeWidth + containerWidth;

      // Calculate duration based on scroll speed
      const duration = totalDistance / SCROLL_SPEED;

      setAnimationDuration(`${duration}s`);
    };

    handleResize();

    // Recalculate on window resize to maintain responsiveness
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [bannerContent]);

  if (!bannerContent) return null;

  return (
    <div className="bg-indigo-600 text-white overflow-hidden py-2">
      <div className="marquee-container">
        <div
          className="animate-marquee"
          ref={marqueeRef}
          style={{
            animationDuration: animationDuration,
          }}
        >
          {bannerContent}
        </div>
      </div>
    </div>
  );
}
