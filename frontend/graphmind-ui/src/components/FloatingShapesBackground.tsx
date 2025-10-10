"use client";
import React from "react";

// Subtle animated floating shapes (circles and blobs)
export default function FloatingShapesBackground({ className = "" }) {
  return (
    <div className={"absolute inset-0 w-full h-full pointer-events-none z-0 " + className} aria-hidden="true">
      {/* Animated circles */}
      <div className="floating-shape bg-primary-400/20 w-32 h-32 rounded-full blur-2xl absolute left-10 top-1/4 animate-float" style={{animationDuration: '9s'}} />
      <div className="floating-shape bg-secondary-400/20 w-24 h-24 rounded-full blur-2xl absolute right-20 top-1/3 animate-float animation-delay-1000" style={{animationDuration: '12s'}} />
      <div className="floating-shape bg-accent-400/20 w-20 h-20 rounded-full blur-2xl absolute left-1/2 top-10 animate-float animation-delay-2000" style={{animationDuration: '10s'}} />
      {/* Animated blob (SVG) */}
      <svg className="absolute bottom-10 left-1/3 w-48 h-48 opacity-60 animate-float animation-delay-400" viewBox="0 0 200 200" fill="none">
        <defs>
          <linearGradient id="blobGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.12" />
          </linearGradient>
        </defs>
        <path fill="url(#blobGradient)" d="M44.8,-67.2C56.6,-59.2,62.7,-42.2,68.2,-26.2C73.7,-10.2,78.6,4.8,75.2,18.2C71.8,31.6,60.1,43.4,46.2,51.7C32.3,60,16.1,64.8,0.2,64.6C-15.7,64.4,-31.4,59.2,-44.2,50.2C-57,41.2,-66.9,28.4,-70.2,13.7C-73.5,-1,-70.2,-17.6,-62.2,-31.2C-54.2,-44.8,-41.5,-55.4,-27.1,-62.2C-12.7,-69,3.4,-71.9,19.2,-72.2C35,-72.5,51.1,-70.2,44.8,-67.2Z" transform="translate(100 100)" />
      </svg>
    </div>
  );
}
