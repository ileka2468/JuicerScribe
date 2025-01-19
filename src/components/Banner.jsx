import React from "react";
import "./css/Banner.css";

export default function Banner() {
  return (
    <div className="bg-indigo-600 text-white overflow-hidden py-2">
      <div className="animate-marquee">
        We will be adding videos and officially launching in beta on Friday,
        January 24th. So clean your sticky keyboards and get ready to
        transcribe! 🚀
      </div>
    </div>
  );
}
