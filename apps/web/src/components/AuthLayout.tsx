import React, { useEffect } from 'react'
import { motion } from 'framer-motion'

type Props = {
  children: React.ReactNode
}

export default function AuthLayout({ children }: Props) {
  useEffect(() => {
    try {
      document.documentElement.classList.add('dark')
    } catch {
      // Intentionally empty - localStorage may not be available
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-zinc-900 text-white">
      {/* Mesh gradient blobs */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 -z-10"
      >
        <motion.div
          className="absolute w-[520px] h-[520px] rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(circle at 30% 30%, rgba(99,102,241,0.18), transparent 35%), radial-gradient(circle at 70% 70%, rgba(139,92,246,0.14), transparent 40%)',
            left: '-10%',
            top: '-10%',
          }}
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
        />

        <motion.div
          className="absolute w-[420px] h-[420px] rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(circle at 20% 80%, rgba(236,72,153,0.12), transparent 35%), radial-gradient(circle at 80% 20%, rgba(59,130,246,0.10), transparent 40%)',
            right: '-8%',
            bottom: '-6%',
          }}
          animate={{ x: [0, -25, 0], y: [0, 18, 0] }}
          transition={{ duration: 12, repeat: Infinity, repeatType: 'reverse' }}
        />

        <motion.div
          className="absolute w-[300px] h-[300px] rounded-full blur-2xl"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(99,102,241,0.10), transparent 30%)',
            left: '50%',
            top: '10%',
            transform: 'translateX(-50%)',
          }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 8, repeat: Infinity, repeatType: 'reverse' }}
        />
      </motion.div>

      <div className="relative z-10 w-full max-w-md p-6">{children}</div>
    </div>
  )
}
