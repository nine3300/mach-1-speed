import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'

type Props = {
  children: React.ReactNode
}

export default function AuthLayout({ children }: Props) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark'
    } catch {
      return 'dark'
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('theme', theme)
      if (theme === 'dark') document.documentElement.classList.add('dark')
      else document.documentElement.classList.remove('dark')
    } catch {
      // Intentionally empty - localStorage may not be available
    }
  }, [theme])

  const dark = theme === 'dark'

  return (
    <div
      className={`min-h-screen flex items-center justify-center relative overflow-hidden ${dark ? 'bg-zinc-900 text-white' : 'bg-white text-slate-900'}`}
    >
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
          style={
            dark
              ? {
                  background:
                    'radial-gradient(circle at 30% 30%, rgba(99,102,241,0.18), transparent 35%), radial-gradient(circle at 70% 70%, rgba(139,92,246,0.14), transparent 40%)',
                  left: '-10%',
                  top: '-10%',
                }
              : {
                  background:
                    'radial-gradient(circle at 30% 30%, rgba(99,102,241,0.12), transparent 40%), radial-gradient(circle at 70% 70%, rgba(99,102,241,0.06), transparent 50%)',
                  left: '-8%',
                  top: '-6%',
                }
          }
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
        />

        <motion.div
          className="absolute w-[420px] h-[420px] rounded-full blur-3xl"
          style={
            dark
              ? {
                  background:
                    'radial-gradient(circle at 20% 80%, rgba(236,72,153,0.12), transparent 35%), radial-gradient(circle at 80% 20%, rgba(59,130,246,0.10), transparent 40%)',
                  right: '-8%',
                  bottom: '-6%',
                }
              : {
                  background:
                    'radial-gradient(circle at 20% 80%, rgba(236,72,153,0.08), transparent 40%), radial-gradient(circle at 80% 20%, rgba(59,130,246,0.06), transparent 50%)',
                  right: '-6%',
                  bottom: '-4%',
                }
          }
          animate={{ x: [0, -25, 0], y: [0, 18, 0] }}
          transition={{ duration: 12, repeat: Infinity, repeatType: 'reverse' }}
        />

        <motion.div
          className="absolute w-[300px] h-[300px] rounded-full blur-2xl"
          style={
            dark
              ? {
                  background:
                    'radial-gradient(circle at 50% 50%, rgba(99,102,241,0.10), transparent 30%)',
                  left: '50%',
                  top: '10%',
                  transform: 'translateX(-50%)',
                }
              : {
                  background:
                    'radial-gradient(circle at 50% 50%, rgba(99,102,241,0.06), transparent 30%)',
                  left: '50%',
                  top: '8%',
                  transform: 'translateX(-50%)',
                }
          }
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 8, repeat: Infinity, repeatType: 'reverse' }}
        />
      </motion.div>

      <div className="relative z-10 w-full max-w-md p-6">
        <div className="absolute top-4 right-4">
          <button
            aria-label="Toggle theme"
            onClick={() => setTheme(dark ? 'light' : 'dark')}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 dark:bg-white/6 border border-white/6 text-white/90"
          >
            {dark ? (
              <Sun className="w-5 h-5 text-yellow-300" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-600" />
            )}
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}
