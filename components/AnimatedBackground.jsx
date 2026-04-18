'use client'

import { motion } from 'framer-motion'

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-slate-50 dark:bg-slate-950">
      {/* Dynamic blurred orbs for an expensive modern aesthetic */}
      <motion.div
        animate={{
          x: [0, 100, -100, 0],
          y: [0, -100, 100, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/20 dark:bg-blue-600/20 blur-[120px] rounded-full"
      />
      <motion.div
        animate={{
          x: [0, -150, 100, 0],
          y: [0, 100, -50, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/20 dark:bg-purple-600/20 blur-[120px] rounded-full"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-emerald-500/10 dark:bg-emerald-600/10 blur-[100px] rounded-full"
      />
      
      {/* Subtle grid overlay for texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
    </div>
  )
}
