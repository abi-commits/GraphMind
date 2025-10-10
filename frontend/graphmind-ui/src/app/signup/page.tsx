"use client";



import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { signIn } from "next-auth/react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
      <div className="max-w-md w-full bg-card rounded-2xl shadow-glow-lg p-10 space-y-8 border border-border relative">
        {/* Visual accent */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-gradient-to-br from-primary-500 to-secondary-500 p-4 rounded-full shadow-glow flex items-center justify-center">
            <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
        </div>
        <h1 className="text-4xl font-extrabold text-center mt-6 mb-2 gradient-text drop-shadow-glow">Create your account</h1>
        <p className="text-center text-muted-foreground text-lg font-medium mb-6">Sign up to unlock AI-powered knowledge graphs and document insights.</p>
        <div className="flex flex-col gap-5">
          <button
            className="flex items-center justify-center gap-3 py-3 px-6 rounded-lg font-semibold text-lg bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-glow hover:scale-105 transition-all duration-200 focus-visible"
            onClick={() => signIn("google")}
            type="button"
          >
            <span className="bg-white rounded-full p-1 mr-1 flex items-center justify-center"><FcGoogle className="w-6 h-6" /></span>
            Sign up with Google
          </button>
          <button
            className="flex items-center justify-center gap-3 py-3 px-6 rounded-lg font-semibold text-lg bg-gradient-to-r from-gray-900 to-gray-700 text-white shadow-glow hover:scale-105 transition-all duration-200 focus-visible"
            onClick={() => signIn("github")}
            type="button"
          >
            <span className="bg-white rounded-full p-1 mr-1 flex items-center justify-center"><FaGithub className="w-6 h-6 text-gray-900" /></span>
            Sign up with GitHub
          </button>
        </div>
        <div className="text-center text-xs text-muted-foreground mt-4 opacity-80">
          By signing up, you agree to our <a href="/terms" className="underline hover:text-primary">Terms of Service</a> and <a href="/privacy" className="underline hover:text-primary">Privacy Policy</a>.
        </div>
      </div>
    </div>
  );
}
