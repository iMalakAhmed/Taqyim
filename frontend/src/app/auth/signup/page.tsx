"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  useRegisterMutation,
  useLoginMutation,
  useGetCurrentUserQuery,
} from "../../redux/services/authApi";
import UserTypeSelection from "./UserTypeSelection";
import { motion } from "framer-motion";

export default function SignupPage() {
  const [userType, setUserType] = useState<"User" | "Business" | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    email: "",
    password: "",
    confirmPassword: "",
    // Business-specific fields
    businessName: "",
    businessCategory: "",
    businessDescription: "",
    businessAddress: "",
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const { refetch: refetchCurrentUser } = useGetCurrentUserQuery({});

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    if (form.password !== form.confirmPassword) {
      setErrorMsg("Passwords do not match");
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Register the user
      const registerResult = await register({
        email: form.email,
        password: form.password,
        userName: form.firstName,
        type: userType!,
        businessName: form.businessName,
        businessCategory: form.businessCategory,
        businessDescription: form.businessDescription,
        businessAddress: form.businessAddress,
      }).unwrap();

      // 2. Login after successful registration
      const loginResult = await login({
        email: form.email,
        password: form.password,
      }).unwrap();

      // 3. Wait for the current user query to complete
      await refetchCurrentUser();

      // 4. Redirect based on user type or redirect URL from backend
      if (registerResult.redirectUrl) {
        router.push(registerResult.redirectUrl);
      } else {
        router.push("/profile");
      }
    } catch (err: any) {
      setErrorMsg(err.data?.message || err.error || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
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
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-text">
            Or{" "}
            <Link
              href="/auth/login"
              className="font-medium text-primary hover:text-primary-dark"
            >
              sign in to your account
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

      {/** ──────────────────────────────────────────────────────────────── */}
      {/** (B) Newspaper‐Style Signup Card (centered, z-10 so it's on top)      */}
      {/** ──────────────────────────────────────────────────────────────── */}
      {!userType ? (
        <UserTypeSelection onSelect={setUserType} />
      ) : (
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
            {/* pt-8 pushes headline down below the top stripe */}
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
              {userType === "Business"
                ? "Register your business"
                : "Join today to rate your favorite spots"}
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
            onSubmit={handleRegistrationSubmit}
            className="px-6 py-6 space-y-5"
          >
            {/* Basic Info Fields */}
            <motion.div
              className="flex flex-col"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
            >
              <label htmlFor="firstName" className="font-serif text-text mb-1">
                User Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border text-text rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="User Name"
                value={form.firstName}
                onChange={handleChange}
              />
            </motion.div>

            <motion.div
              className="flex flex-col"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1, duration: 0.6 }}
            >
              <label
                htmlFor="email-address"
                className="font-serif text-text mb-1"
              >
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border text-text focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={form.email}
                onChange={handleChange}
              />
            </motion.div>

            <motion.div
              className="flex flex-col"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              <label htmlFor="password" className="font-serif text-text mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border placeholder-gray-500 text-text focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
              />
            </motion.div>

            <motion.div
              className="flex flex-col"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.3, duration: 0.6 }}
            >
              <label
                htmlFor="confirm-password"
                className="font-serif text-text mb-1"
              >
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border placeholder-gray-500 text-text rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
              />
            </motion.div>

            {/* Business-specific fields (conditionally rendered) */}
            {userType === "Business" && (
              <motion.div
                className="space-y-5"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ delay: 1.4, duration: 0.6 }}
              >
                <div className="flex flex-col">
                  <label
                    htmlFor="businessName"
                    className="font-serif text-text mb-1"
                  >
                    Business Name
                  </label>
                  <input
                    id="businessName"
                    name="businessName"
                    type="text"
                    required={userType === "Business"}
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                    placeholder="Business Name"
                    value={form.businessName}
                    onChange={handleChange}
                  />
                </div>

                <div className="flex flex-col">
                  <label
                    htmlFor="businessCategory"
                    className="font-serif text-[var(--text)] mb-1"
                  >
                    Business Category
                  </label>
                  <input
                    id="businessCategory"
                    name="businessCategory"
                    type="text"
                    required={userType === "Business"}
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                    placeholder="Business Category"
                    value={form.businessCategory}
                    onChange={handleChange}
                  />
                </div>

                <div className="flex flex-col">
                  <label
                    htmlFor="businessDescription"
                    className="font-serif text-[var(--text)] mb-1"
                  >
                    Business Description
                  </label>
                  <input
                    id="businessDescription"
                    name="businessDescription"
                    type="text"
                    required={userType === "Business"}
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                    placeholder="Business Description"
                    value={form.businessDescription}
                    onChange={handleChange}
                  />
                </div>

                <div className="flex flex-col">
                  <label
                    htmlFor="businessAddress"
                    className="font-serif text-[var(--text)] mb-1"
                  >
                    Business Address
                  </label>
                  <input
                    id="businessAddress"
                    name="businessAddress"
                    type="text"
                    required={userType === "Business"}
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                    placeholder="Business Address"
                    value={form.businessAddress}
                    onChange={handleChange}
                  />
                </div>
              </motion.div>
            )}

            {errorMsg && (
              <div
                className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative"
                role="alert"
              >
                {errorMsg}
              </div>
            )}

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                disabled={isSubmitting || isRegistering || isLoggingIn}
              >
                {isSubmitting ? "Signing up..." : "Sign up"}
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
}
