import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Lock, Loader2, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'
import { Button } from '@repo/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@repo/ui/Card'
import { toast } from 'sonner'

const AuthSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
})

const ResetSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
})

type AuthForm = z.infer<typeof AuthSchema>
type ResetForm = z.infer<typeof ResetSchema>

function mapFirebaseError(code?: string): string {
  const errorMap: Record<string, string> = {
    'auth/user-not-found': 'No account found with this email.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/wrong-password': 'Incorrect password, please try again.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled.',
    'auth/popup-closed-by-user': 'Sign-in was cancelled.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
  }
  return errorMap[code ?? ''] || 'An unexpected error occurred. Please try again.'
}

export function AuthForm() {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [resetSent, setResetSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset: _resetForm,
  } = useForm<AuthForm>({
    resolver: zodResolver(AuthSchema),
  })

  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
    watch: watchReset,
  } = useForm<ResetForm>({
    resolver: zodResolver(ResetSchema),
  })

  const resetEmail = watchReset('email')

  async function handleEmailAuth(values: AuthForm) {
    setFormError(null)
    setSubmitting(true)
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, values.email, values.password)
        toast.success(`Welcome back, ${values.email}!`)
      } else {
        await createUserWithEmailAndPassword(auth, values.email, values.password)
        toast.success(`Account created! Welcome, ${values.email}!`)
      }
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string }
      const friendlyMessage = mapFirebaseError(firebaseError?.code)
      setFormError(friendlyMessage)
      toast.error(friendlyMessage)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGoogleLogin() {
    setFormError(null)
    setSubmitting(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      toast.success(`Welcome, ${user.displayName || user.email}!`)
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string }
      const friendlyMessage = mapFirebaseError(firebaseError?.code)
      setFormError(friendlyMessage)
      toast.error(friendlyMessage)
    } finally {
      setSubmitting(false)
    }
  }

  async function handlePasswordReset(values: ResetForm) {
    setFormError(null)
    setSubmitting(true)
    try {
      await sendPasswordResetEmail(auth, values.email)
      setResetSent(true)
      toast.success('Password reset email sent! Check your inbox.')
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string }
      const friendlyMessage = mapFirebaseError(firebaseError?.code)
      setFormError(friendlyMessage)
      toast.error(friendlyMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleBackToLogin = () => {
    setMode('login')
    setFormError(null)
    setResetSent(false)
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full"
      >
        <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-[#2A3142] to-[#1A1F2E] text-white backdrop-blur-xl border border-[#2A3142] shadow-2xl hover:border-[#CCFF00]/30 transition-all rounded-2xl">
          <CardHeader className="px-6 pt-6">
            {mode === 'reset' ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={handleBackToLogin}
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 border border-white/10 text-zinc-300 hover:bg-white/20 transition-colors"
                    aria-label="Back to login"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
                <CardTitle className="text-center text-2xl font-bold tracking-tight">
                  Reset your password
                </CardTitle>
                <CardDescription className="text-center text-sm text-zinc-400 mt-1">
                  Enter your email and we'll send you a password reset link
                </CardDescription>
              </>
            ) : (
              <>
                <CardTitle className="text-center text-2xl font-bold tracking-tight">
                  {mode === 'login' ? 'Welcome back' : 'Create your account'}
                </CardTitle>
                <CardDescription className="text-center text-sm text-zinc-400 mt-1">
                  {mode === 'login'
                    ? 'Sign in to continue to Mach 1 Speed'
                    : 'Sign up to start your fitness journey'}
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent className="px-6 pb-6">
            {mode === 'reset' ? (
              // Password Reset Form
              <>
                {resetSent ? (
                  <div className="text-center space-y-4">
                    <div className="p-4 rounded-lg bg-emerald-900/40 border border-emerald-700/30">
                      <p className="text-sm text-emerald-200">
                        Password reset email has been sent to{' '}
                        <span className="font-semibold">{resetEmail}</span>
                      </p>
                      <p className="text-xs text-emerald-200/70 mt-2">
                        Check your email and follow the link to reset your password.
                      </p>
                    </div>
                    <Button
                      onClick={handleBackToLogin}
                      className="w-full py-3 bg-[#CCFF00] text-black hover:bg-[#CCFF00]/90 font-semibold"
                    >
                      Back to Login
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleResetSubmit(handlePasswordReset)} className="space-y-4">
                    {/* Email Field */}
                    <label className="block">
                      <div className="flex items-center gap-2 mb-2 text-sm text-zinc-300">
                        <Mail className="w-4 h-4 text-zinc-400" />
                        <span className="font-medium">Email</span>
                      </div>
                      <input
                        type="email"
                        {...registerReset('email')}
                        className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#CCFF00]/50 transition-colors duration-200"
                        placeholder="you@example.com"
                      />
                      {resetErrors.email && (
                        <p className="text-sm text-rose-400 mt-1">{resetErrors.email.message}</p>
                      )}
                    </label>

                    {/* Form-level Error */}
                    {formError && (
                      <div className="p-3 rounded-lg bg-rose-900/40 border border-rose-700/30 text-rose-200">
                        <p className="text-sm">{formError}</p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div>
                      <motion.div whileTap={{ scale: 0.98 }}>
                        <Button
                          type="submit"
                          disabled={submitting}
                          className="w-full flex items-center justify-center gap-2 py-3 bg-[#CCFF00] text-black hover:bg-[#CCFF00]/90 disabled:opacity-60 font-semibold"
                        >
                          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                          Send Reset Link
                        </Button>
                      </motion.div>
                    </div>

                    <button
                      type="button"
                      onClick={handleBackToLogin}
                      className="w-full text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                      Back to Login
                    </button>
                  </form>
                )}
              </>
            ) : (
              // Login/Signup Form
              <>
                {/* Mode Toggle */}
                <div className="flex justify-center gap-2 mb-6">
                  <button
                    onClick={() => {
                      setMode('login')
                      setFormError(null)
                    }}
                    className={`px-4 py-2 rounded-full font-medium transition-colors duration-200 text-sm ${
                      mode === 'login'
                        ? 'bg-[#CCFF00] text-black shadow-md'
                        : 'bg-transparent text-zinc-300 hover:bg-white/10'
                    }`}
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => {
                      setMode('signup')
                      setFormError(null)
                    }}
                    className={`px-4 py-2 rounded-full font-medium transition-colors duration-200 text-sm ${
                      mode === 'signup'
                        ? 'bg-[#CCFF00] text-black shadow-md'
                        : 'bg-transparent text-zinc-300 hover:bg-white/10'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                <form onSubmit={handleSubmit(handleEmailAuth)} className="space-y-4 mb-6">
                  {/* Email Field */}
                  <label className="block">
                    <div className="flex items-center gap-2 mb-2 text-sm text-zinc-300">
                      <Mail className="w-4 h-4 text-zinc-400" />
                      <span className="font-medium">Email</span>
                    </div>
                    <input
                      type="email"
                      {...register('email')}
                      className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#CCFF00]/50 transition-colors duration-200"
                      placeholder="you@example.com"
                    />
                    {errors.email && (
                      <p className="text-sm text-rose-400 mt-1">{errors.email.message}</p>
                    )}
                  </label>

                  {/* Password Field */}
                  <label className="block">
                    <div className="flex items-center gap-2 mb-2 text-sm text-zinc-300">
                      <Lock className="w-4 h-4 text-zinc-400" />
                      <span className="font-medium">Password</span>
                    </div>
                    <input
                      type="password"
                      {...register('password')}
                      className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#CCFF00]/50 transition-colors duration-200"
                      placeholder="••••••••"
                    />
                    {errors.password && (
                      <p className="text-sm text-rose-400 mt-1">{errors.password.message}</p>
                    )}
                  </label>

                  {/* Forgot Password Link (only show on login) */}
                  {mode === 'login' && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setMode('reset')
                          setFormError(null)
                        }}
                        className="text-xs text-zinc-400 hover:text-[#CCFF00] transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  {/* Form-level Error */}
                  {formError && (
                    <div className="p-3 rounded-lg bg-rose-900/40 border border-rose-700/30 text-rose-200">
                      <p className="text-sm">{formError}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div>
                    <motion.div whileTap={{ scale: 0.98 }}>
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-[#CCFF00] text-black hover:bg-[#CCFF00]/90 disabled:opacity-60 font-semibold"
                      >
                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {mode === 'login' ? 'Sign In' : 'Create Account'}
                      </Button>
                    </motion.div>
                  </div>
                </form>

                {/* Divider */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gradient-to-br from-[#2A3142] to-[#1A1F2E] text-zinc-400">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Google Sign-In */}
                <motion.div whileTap={{ scale: 0.98 }}>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={submitting}
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-2 py-2 border border-white/10 bg-white/5 text-white hover:bg-white/10"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                    )}
                    Sign in with Google
                  </Button>
                </motion.div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
