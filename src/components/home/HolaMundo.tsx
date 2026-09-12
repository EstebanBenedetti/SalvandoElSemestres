"use client";

import { motion } from "framer-motion";

export function HolaMundo() {
  return (
    <motion.section
      className="flex min-h-screen items-center justify-center px-6 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      style={{
        background:
          "radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.28), transparent 32%), radial-gradient(circle at 80% 75%, rgba(14, 165, 233, 0.2), transparent 34%), #07111f",
      }}
    >
      <div className="relative z-10 flex max-w-4xl flex-col items-center">
        <div className="mb-10 flex flex-col items-center font-sans text-[clamp(4.5rem,14vw,10rem)] font-extrabold leading-[0.82] tracking-[-0.06em]">
          <motion.span
            className="bg-gradient-to-r from-sky-300 via-blue-400 to-cyan-300 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            Hola
          </motion.span>
          <motion.span
            className="text-white"
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          >
            Mundo
          </motion.span>
        </div>

        <motion.div
          className="mb-8 h-px w-24 origin-center bg-cyan-300"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 1, ease: "easeInOut" }}
        />

        <motion.p
          className="max-w-xl text-lg tracking-wide text-slate-300 sm:text-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.3 }}
        >
          Una base sólida para salvar el semestre con TypeScript, datos tipados y buenas ideas.
        </motion.p>

        <motion.span
          className="mt-8 rounded-full border border-cyan-200/30 bg-cyan-100/10 px-4 py-2 font-mono text-sm text-cyan-100"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 1.6, stiffness: 260, damping: 20 }}
        >
          TypeScript / Fullstack
        </motion.span>
      </div>
    </motion.section>
  );
}
