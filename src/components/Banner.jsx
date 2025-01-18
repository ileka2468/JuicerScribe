import React from "react";
import "./css/Banner.css";

export default function Banner() {
  return (
    <div className="bg-indigo-600 text-white text-center py-2">
      <div className="inline-block animate-marquee">
        We will be adding videos and officially launching in beta on Tuesday,
        January 18th. So clean your sticky keyboards and get ready to
        transcribe! 🚀
      </div>
    </div>
  );
}
