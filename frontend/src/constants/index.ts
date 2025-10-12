// Application constants

export const APP_NAME = "GraphMind";
export const APP_VERSION = "0.0.0";

// API endpoints (configure as needed)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Animation durations
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Z-index layers
export const Z_INDEX = {
  DROPDOWN: 1000,
  MODAL: 2000,
  TOAST: 3000,
  TOOLTIP: 4000,
} as const;

// Add more constants as needed
