"use client";

import { motion } from "framer-motion";

export default function DownloadButton({
  href,
  label,
  secondary = false,
}: {
  href: string;
  label: string;
  secondary?: boolean;
}) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      // Tiny "launch" pop on press — the only micro-flair this button gets
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 500, damping: 24 }}
      className={
        secondary
          ? "btn-outline inline-block px-5 py-2.5 text-sm"
          : "btn-grad inline-block px-6 py-3 text-sm"
      }
    >
      {label}
    </motion.a>
  );
}
