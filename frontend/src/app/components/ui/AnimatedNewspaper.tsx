"use client";

import { motion } from "framer-motion";

const scrollingText = {
  animate: {
    y: ["0%", "-100%"],
    transition: {
      duration: 100,
      ease: "linear",
      repeat: Infinity,
    },
  },
};

// Your 3 different pieces of content, split as arrays
const content = [
  [
    "Column 1 — Suspendisse potenti. Donec gravida diam nec elit. Aliquam erat volutpat. Quisque vehicula ex sed augue convallis... Aliquam erat volutpat. Quisque vehicula ex sed augue convallis...",
    "Pellentesque habitant morbi tristique senectus et netus. Aliquam erat volutpat. Quisque vehicula ex sed augue convallis...",
    "Aliquam erat volutpat. Quisque vehicula ex sed augue convallis...Aliquam erat volutpat. Quisque vehicula ex sed augue convallis...Aliquam erat volutpat. Quisque vehicula ex sed augue convallis...",
  ],
  [
    "Column 2 — Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam erat volutpat. Quisque vehicula ex sed augue convallis...",
    "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices.Aliquam erat volutpat. Quisque vehicula ex sed augue convallis...",
    "Etiam faucibus, sem sit amet commodo bibendum, purus arcu congue metus. Aliquam erat volutpat. Quisque vehicula ex sed augue convallis...",
  ],
  [
    "Column 3 — Proin sed risus eu sem fermentum fermentum.Aliquam erat volutpat. Quisque vehicula ex sed augue convallis...",
    "Integer nec magna sed odio posuere tristique.Aliquam erat volutpat. Quisque vehicula ex sed augue convallis...",
    "Donec viverra erat a felis pharetra, sit amet ultricies massa luctus.Aliquam erat volutpat. Quisque vehicula ex sed augue convallis...",
  ],
];

export default function AnimatedNewspaper() {
  return (
    <div className="relative w-full max-w-5xl mt-8 px-4 h-[400px]">
      <motion.div
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.2,
            },
          },
        }}
        initial="hidden"
        animate="show"
        className="absolute inset-0 grid grid-cols-3 gap-6 text-sm leading-relaxed text-gray-700 blur-sm select-none pointer-events-none overflow-hidden"
      >
        {content.map((paragraphs, i) => (
          <motion.section
            key={i}
            variants={{
              hidden: { opacity: 0, y: 30 },
              show: { opacity: 1, y: 0 },
            }}
            className="overflow-hidden h-full"
          >
            <motion.div
              variants={scrollingText}
              animate="animate"
              className="flex flex-col space-y-4"
            >
              {/* Duplicate blocks for infinite scroll effect */}
              {[...Array(2)].map((_, dupIndex) => (
                <div key={dupIndex}>
                  <p>
                    {paragraphs.map((line, lineIndex) => (
                      <span key={lineIndex}>
                        {line}
                        <br />
                        <br />
                      </span>
                    ))}
                  </p>
                </div>
              ))}
            </motion.div>
          </motion.section>
        ))}
      </motion.div>
    </div>
  );
}
