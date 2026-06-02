"use client";

import { motion } from "framer-motion";

export default function AtmosphericBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      {/* Orb 1: Primary color */}
      <motion.div
        animate={{
          x: [0, 60, -40, 0],
          y: [0, -40, 50, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-[500px] h-[500px] rounded-full bg-primary/10 top-[-100px] left-[-100px] filter blur-[100px]"
      />

      {/* Orb 2: Secondary color */}
      <motion.div
        animate={{
          x: [0, -50, 40, 0],
          y: [0, 60, -30, 0],
          scale: [1, 0.95, 1.05, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute w-[400px] h-[400px] rounded-full bg-secondary/10 bottom-[-50px] right-[-50px] filter blur-[100px]"
      />

      {/* Orb 3: Tertiary color */}
      <motion.div
        animate={{
          x: [0, 40, -40, 0],
          y: [0, 30, -50, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5,
        }}
        className="absolute w-[300px] h-[300px] rounded-full bg-tertiary/5 top-1/2 left-1/3 filter blur-[90px]"
      />
    </div>
  );
}
