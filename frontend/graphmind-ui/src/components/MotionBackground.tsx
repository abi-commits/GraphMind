"use client";
import React from "react";

// Subtle animated SVG waves for background motion
export default function MotionBackground({ className = "" }) {
  return (
    <svg
      className={"absolute inset-0 w-full h-full pointer-events-none z-0 " + className}
      viewBox="0 0 1440 320"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      <path>
        <animate 
          attributeName="d"
          dur="7s"
          repeatCount="indefinite"
          values="M0,160 C360,240 1080,80 1440,160 L1440,320 L0,320 Z;
                  M0,120 C400,200 1040,120 1440,200 L1440,320 L0,320 Z;
                  M0,160 C360,240 1080,80 1440,160 L1440,320 L0,320 Z"
        />
      </path>
      <path
        d="M0,192 C480,288 960,96 1440,192 L1440,320 L0,320 Z"
        fill="url(#waveGradient)"
        opacity="0.7"
      >
        <animate 
          attributeName="d"
          dur="9s"
          repeatCount="indefinite"
          values="M0,192 C480,288 960,96 1440,192 L1440,320 L0,320 Z;
                  M0,160 C400,240 1040,160 1440,240 L1440,320 L0,320 Z;
                  M0,192 C480,288 960,96 1440,192 L1440,320 L0,320 Z"
        />
      </path>
    </svg>
  );
}
