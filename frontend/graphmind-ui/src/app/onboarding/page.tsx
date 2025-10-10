"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [name, setName] = useState(session?.user?.name || "");
  const [step, setStep] = useState(1);

  useEffect(() => {
    // If not logged in, redirect to sign up
    if (status === "unauthenticated") {
      router.replace("/signup");
    }
  }, [status, router]);

  function handleNext() {
    // Here you would call your backend to save onboarding info
    // For now, just redirect to home
    router.replace("/");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
      <div className="max-w-lg w-full bg-card rounded-2xl shadow-glow-lg p-10 space-y-8 border border-border text-center">
        <h1 className="text-3xl font-extrabold gradient-text drop-shadow-glow mb-2">Welcome to GraphMind!</h1>
        <p className="text-muted-foreground text-lg mb-6">Let's get you set up in just a few seconds.</p>
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-left font-semibold mb-2">Your Name</label>
              <input
                id="name"
                type="text"
                className="w-full px-4 py-3 rounded-lg border border-border bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <button
              className="btn-primary w-full py-3 text-lg mt-4"
              onClick={handleNext}
              disabled={!name.trim()}
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
