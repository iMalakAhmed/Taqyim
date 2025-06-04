"use client";
import VerticalLine from "./ui/VerticalLine";
import Image from "next/image";
import Button from "./ui/Button";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const slideInLeft = {
  hidden: { x: -100, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
};

const slideInRight = {
  hidden: { x: 100, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
};

export default function HeroSection() {
  const [date, setDate] = useState("");

  useEffect(() => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = now.toLocaleString("en-US", { month: "short" }).toUpperCase();
    const year = now.getFullYear();
    setDate(`${day} ${month} ${year}`);
  }, []);
  return (
    <div className="w-full max-h-[500px] flex flex-row justify-center items-center text-text">
      {/* IMAGE SECTION */}
      <motion.section
        className="w-2/3 ml-24 flex flex-col justify-center items-start"
        variants={slideInLeft}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-xl font-body font-bold p-2">JOIN OUR COMMUNITY</h2>
        <Image
          src="/reviewer-hero-section.jpg"
          alt="Review typewriter"
          width={600}
          height={400}
          className="filter grayscale hover:grayscale-0 transition duration-500 ease-in-out"
        />
      </motion.section>

      <VerticalLine className="h-[500px]" />

      {/* TEXT & CTA SECTION */}
      <motion.section
        className="w-1/3 m-24 text-justify"
        variants={slideInRight}
        initial="hidden"
        animate="visible"
      >
        <p className="font-body text-lg text-right">{date}</p>
        <h2 className="text-3xl font-heading py-3">
          Make Headlines —{" "}
          <span className="text-accent">Start Writing Reviews Today. </span>
        </h2>
        <p className="font-body font-extralight text-2xl tracking-wider leading-8 pb-5 ">
          Put your name in print. Share honest takes on local spots and help
          your neighbors discover what’s worth their time.
          <br />
          <br />
          No subscription required — just your voice.
        </p>
        <Button size="xl" className="w-full" onClick={() => router.push('/auth/signup')}>
          SIGN UP
        </Button>
      </motion.section>
    </div>
  );
}
