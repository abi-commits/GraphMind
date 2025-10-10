"use client";
import { useEffect } from "react";

export default function ParallaxEffect() {
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      document.querySelectorAll<HTMLElement>(".parallax-shape").forEach((el, i) => {
        const speed = 0.15 + i * 0.07;
        el.style.transform = `translateY(${scrollY * speed}px)`;
      });
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return null;
}
