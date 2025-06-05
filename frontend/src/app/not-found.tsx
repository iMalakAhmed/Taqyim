"use client";

import Link from "next/link";
import HorizontalLine from "./components/ui/HorizontalLine";
import { motion } from "framer-motion";
import AnimatedNewspaper from "./components/ui/BlurredText";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-text py-24 flex flex-col items-center font-body">
      <HorizontalLine />
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-5xl font-heading font-bold my-3"
      >
        Oh no!
      </motion.h1>

      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        className="text-3xl font-heading font-bold mb-6 text-primary"
      >
        404 - Page Not Found
      </motion.h2>
      <HorizontalLine />

      {/* Container relative to position the clear paragraph absolutely */}

      <AnimatedNewspaper />

      {/* Clear paragraph, centered and on top */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute top-1/2 left-1/2 max-w-3xl -translate-x-1/2 -translate-y-1/2 text-center text-lg text-text z-20 px-6 py-4 bg-background bg-opacity-90 rounded shadow-md"
      >
        Looks like the page you're after is missing — lost to the annals of
        cyberspace or never penned in the first place. Rest assured, our
        diligent reporters are investigating this enigma, but until then, we
        invite you to{" "}
        <span className="text-accent hover:cursor-pointer">
          <Link href="/home">return to safer ground.</Link>
        </span>
      </motion.p>
    </div>
  );
}
