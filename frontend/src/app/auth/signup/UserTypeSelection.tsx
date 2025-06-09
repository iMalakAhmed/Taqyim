"use client";

import { motion } from "framer-motion";
import { Dispatch, SetStateAction } from "react";

interface UserTypeSelectionProps {
  onSelect: Dispatch<SetStateAction<"User" | "Business" | null>>;
}

export default function UserTypeSelection({
  onSelect,
}: UserTypeSelectionProps) {
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

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.div
      className="relative z-10 bg-background border text-text rounded-sm shadow-2xl w-full max-w-md"
      variants={cardVariant}
      initial="hidden"
      animate="visible"
      style={{ perspective: 800 }}
    >
      <div className="px-6 pt-8">
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
              className="text-4xl font-serif font-bold tracking-tight "
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </motion.div>
        <p className="text-center italic text-text opacity-75 mb-4">
          {today} Edition
        </p>
      </div>

      <div className="px-6">
        <motion.hr
          className="mb-2 origin-center"
          variants={ruleVariant}
          initial="hidden"
          animate="visible"
        />
        <p className="text-center text-sm italic text-text opacity-75">
          Choose your account type to get started
        </p>
        <motion.hr
          className="mt-2 origin-center"
          variants={ruleVariant}
          initial="hidden"
          animate="visible"
        />
      </div>

      <div className="px-6 py-6 space-y-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full p-4 border-2 rounded-sm hover:opacity-50 transition-colors"
          onClick={() => onSelect("User")}
        >
          <h3 className="text-xl font-serif font-bold mb-2">
            Personal Account
          </h3>
          <p className="text-text opacity-75 text-sm">
            Create a personal account to rate and review businesses, follow
            other users, and share your experiences.
          </p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full p-4 border-2 rounded-sm hover:opacity-50 transition-colors"
          onClick={() => onSelect("Business")}
        >
          <h3 className="text-xl font-serif font-bold mb-2">
            Business Account
          </h3>
          <p className="text-text opacity-75 text-sm">
            Create a business account to manage your business profile, respond
            to reviews, and engage with customers.
          </p>
        </motion.button>
      </div>
    </motion.div>
  );
}
