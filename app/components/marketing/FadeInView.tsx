"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FadeInViewProps {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}

const FadeInView = ({ children, delay = 0, direction = "up" }: FadeInViewProps) => {
  const directions = { up: { y: 20, x: 0 }, down: { y: -20, x: 0 }, left: { x: 20, y: 0 }, right: { x: -20, y: 0 } };
  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
};
export default FadeInView;
