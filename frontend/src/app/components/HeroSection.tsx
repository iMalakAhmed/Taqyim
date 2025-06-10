"use client";

import VerticalLine from "./ui/VerticalLine";
import Image from "next/image";
import Button from "./ui/Button";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const slideLeft = {
  hidden: { x: -100, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
  exit: { x: -150, opacity: 0, transition: { duration: 0.5, ease: "easeIn" } },
};

const slideRight = {
  hidden: { x: 100, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
  exit: { x: 150, opacity: 0, transition: { duration: 0.5, ease: "easeIn" } },
};

const slideUp = {
  hidden: { y: 100, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
  exit: { y: 150, opacity: 0, transition: { duration: 0.5, ease: "easeIn" } },
};

export default function HeroSection() {
  const [date, setDate] = useState("");
  const [inView, setInView] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = now.toLocaleString("en-US", { month: "short" }).toUpperCase();
    const year = now.getFullYear();
    setDate(`${day} ${month} ${year}`);

    // Check if mobile
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize(); // Set initial value
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: "-30% 0px -30% 0px",
        threshold: 0.1,
      }
    );

    observer.observe(containerRef.current);

    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full min-h-[500px] md:max-h-[500px] flex flex-col md:flex-row justify-center items-center text-text relative px-4 md:px-0"
    >
      {/* TEXT & CTA SECTION - Shows second on mobile */}
      <motion.section
        className="order-1 md:order-3 w-full md:w-1/3 md:m-24 text-justify mt-8"
        variants={isMobile ? slideUp : slideRight}
        initial="hidden"
        animate={inView ? "visible" : "exit"}
      >
        <p className="font-body text-lg text-right">{date}</p>
        <h2 className="text-2xl md:text-3xl font-heading py-3">
          Make Headlines —{" "}
          <span className="text-accent">Start Writing Reviews Today. </span>
        </h2>
        <p className="font-body font-extralight text-lg md:text-2xl tracking-wider leading-6 md:leading-8 pb-5">
          Put your name in print. Share honest takes on local spots and help
          your neighbors discover what's worth their time.
          <br />
          <br />
          No subscription required — just your voice.
        </p>
        <Button
          size={isMobile ? "lg" : "xl"}
          className="w-full"
          onClick={() => router.push("/auth/signup")}
        >
          SIGN UP
        </Button>
      </motion.section>

      {/* Vertical Line - Only visible on desktop, between image and text */}
      <div className="hidden md:block order-2">
        <VerticalLine className="h-[500px]" />
      </div>

      {/* IMAGE SECTION - Shows first on mobile */}
      <motion.section
        className="order-2 md:order-1 w-full md:w-2/3 md:ml-24 flex flex-col justify-center items-start pt-8"
        variants={isMobile ? slideUp : slideLeft}
        initial="hidden"
        animate={inView ? "visible" : "exit"}
      >
        <h2 className="text-xl font-body font-bold p-2">JOIN OUR COMMUNITY</h2>
        <div className="w-full h-auto relative aspect-video">
          <Image
            src="/reviewer-hero-section.jpg"
            alt="Review typewriter"
            width={600}
            height={400}
            className="object-cover filter grayscale hover:grayscale-0 transition duration-500 ease-in-out"
          />
        </div>
      </motion.section>
    </div>
  );
}
