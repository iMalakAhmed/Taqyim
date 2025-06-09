"use client";

import { useLoginMutation } from "../../redux/services/authApi";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [login, { isLoading, error }] = useLoginMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      // Store token in session storage for client-side access
      sessionStorage.setItem('token', res.token);
      console.log("Token stored in session storage:", res.token);
      router.push("/profile");
    } catch (err: any) {
      console.error("Login failed:", err);
    }
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const tapeContent = "• THE DAILY RATING • YOUR GUIDE TO EVERYTHING LOCAL •";

  const cardVariant = {
    hidden: { opacity: 0, scale: 0.8, rotateX: 90, y: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      rotateX: 0,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const headlineContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const letterVariant = {
    hidden: { opacity: 0, y: 20, rotateX: 90 },
    visible: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.3 } },
  };

  const ruleVariant = {
    hidden: { scaleX: 0 },
    visible: { scaleX: 1, transition: { duration: 0.5, delay: 0.8 } },
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-text bg-background pt-20 px-4 sm:px-6 lg:px-8 overflow-hidden relative font-sans">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-text">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-text">
            Or{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-primary hover:text-primary-dark"
            >
              create an account
            </Link>
          </p>
        </div>
      </div>

      {/* ───────────── Bottom Fixed Stripe ───────────── */}
      <div className="fixed bottom-0 left-0 w-full h-8 overflow-hidden pointer-events-none">
        <div className="animate-marquee-thin tape-text-thin w-[200%]">
          {tapeContent}
        </div>
      </div>

      <motion.div
        className="relative z-10 bg-background border rounded-sm shadow-2xl w-full max-w-md"
        variants={cardVariant}
        initial="hidden"
        animate="visible"
        style={{ perspective: 800 }}
      >
        {/* ───────────── 1) Animated Headline ───────────── */}
        <div className="px-6 pt-8">
          {" "}
          <motion.div
            className="flex justify-center mb-2"
            variants={headlineContainer}
            initial="hidden"
            animate="visible"
          >
            {"THE DAILY RATING".split("").map((char, idx) => (
              <motion.span
                key={idx}
                variants={letterVariant}
                className="text-4xl font-serif font-bold tracking-tight text-text"
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </motion.div>
          <p className="text-center italic text-text mb-4">{today} Edition</p>
        </div>

        {/* ───────────── 2) Subtitle & Animated Rules ───────────── */}
        <div className="px-6">
          <motion.hr
            className="border mb-2 origin-center"
            variants={ruleVariant}
            initial="hidden"
            animate="visible"
          />
          <p className="text-center text-sm italic text-text">
            Sign in to rate your favorite spots
          </p>
          <motion.hr
            className="border mt-2 origin-center"
            variants={ruleVariant}
            initial="hidden"
            animate="visible"
          />
        </div>

        {/* ───────────── 3) Form Fields with Slide-In ───────────── */}
        <form
          onSubmit={handleSubmit}
          className="px-6 py-6 space-y-5"
        >
          <motion.div
            className="flex flex-col"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0, duration: 0.6 }}
          >
            <label htmlFor="email" className="font-serif text-text mb-1">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border text-text rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </motion.div>

          <motion.div
            className="flex flex-col"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
          >
            <label htmlFor="password" className="font-serif text-text mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border text-text rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </motion.div>

          <button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark transition duration-150 ease-in-out"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Sign In"}
          </button>
          {error && <p className="text-red-500 text-sm mt-2 text-center">Login failed.</p>}
        </form>
      </motion.div>
    </div>
  );
}
