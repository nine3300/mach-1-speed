import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react'
import type { UserCredential } from 'firebase/auth'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { motion } from 'framer-motion'

const AuthSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
})

type AuthForm = z.infer<typeof AuthSchema>

function mapFirebaseError(code?: string) {
  const map: Record<string, string> = {
    'auth/user-not-found': 'No account found for this email.',
    'auth/wrong-password': 'Incorrect password, please try again.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/weak-password': 'Password is too weak.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
  }
  if (!code) return 'An unexpected error occurred.'
  return map[code] ?? 'An unexpected error occurred. ' + code
}

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthForm>({
    resolver: zodResolver(AuthSchema),
  })

  async function handleAuth(values: AuthForm) {
    setFormError(null)
    setSubmitting(true)
    try {
      let cred: UserCredential
      if (mode === 'login') {
        cred = await signInWithEmailAndPassword(auth, values.email, values.password)
      } else {
        cred = await createUserWithEmailAndPassword(auth, values.email, values.password)
      }
      console.info('Signed in:', cred.user.uid)
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string }
      setFormError(mapFirebaseError(firebaseError?.code))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F1419] flex flex-col items-center justify-center p-4">
      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="w-full max-w-md mx-auto bg-gradient-to-br from-[#2A3142] to-[#1A1F2E] text-white backdrop-blur-xl border border-[#2A3142] shadow-2xl rounded-2xl p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black text-white mb-2">Welcome back</h1>
            <p className="text-zinc-400">Sign in to continue to Mach 1 Speed</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-4 mb-8 p-1.5 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setFormError(null)
              }}
              className={`flex-1 py-2.5 px-4 rounded-md font-semibold transition-all text-sm ${
                mode === 'login'
                  ? 'bg-[#CCFF00] text-black shadow-md'
                  : 'text-zinc-300 hover:bg-white/10'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup')
                setFormError(null)
              }}
              className={`flex-1 py-2.5 px-4 rounded-md font-semibold transition-all text-sm ${
                mode === 'signup'
                  ? 'bg-[#CCFF00] text-black shadow-md'
                  : 'text-zinc-300 hover:bg-white/10'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit(handleAuth)} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <input
                type="email"
                {...register('email')}
                placeholder="you@example.com"
                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#CCFF00]/50 transition-colors duration-200"
              />
              {errors.email && (
                <p className="text-rose-400 text-xs mt-1.5 font-semibold">{errors.email.message}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#CCFF00]/50 transition-colors duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-rose-400 text-xs mt-1.5 font-semibold">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Error Message */}
            {formError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-rose-900/40 border border-rose-700/30 rounded-lg"
              >
                <p className="text-rose-200 text-sm font-semibold">{formError}</p>
              </motion.div>
            )}

            {/* Forgot Password (Login only) */}
            {mode === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-zinc-400 hover:text-[#CCFF00] font-semibold transition-colors"
                  onClick={() => alert('Password reset coming soon')}
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full h-12 bg-[#CCFF00] hover:bg-[#BBFF00] text-black font-bold rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-70 flex items-center justify-center gap-2 text-base"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                <>{mode === 'login' ? 'Sign In' : 'Create Account'}</>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-gradient-to-br from-[#2A3142] to-[#1A1F2E] text-zinc-400 font-semibold">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            className="w-full h-12 border border-white/10 bg-white/5 text-white hover:bg-white/10 font-bold rounded-lg transition-all flex items-center justify-center gap-3"
            onClick={() => alert('Google sign-in coming soon')}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Sign in with Google</span>
          </button>
        </div>

        {/* Footer Text */}
        <p className="text-center text-zinc-400 text-xs mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  )
}

export default AuthPage
