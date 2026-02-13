import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Lock, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'
import { Button } from '@repo/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@repo/ui/Card'
import { toast } from 'sonner'

const AuthSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
})

type AuthForm = z.infer<typeof AuthSchema>

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
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthForm>({
    resolver: zodResolver(AuthSchema),
  })

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

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full"
      >
        <Card className="w-full max-w-md mx-auto bg-white/80 text-slate-900 dark:bg-white/6 dark:text-white backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-lg dark:shadow-2xl">
          <CardHeader className="px-6 pt-6">
            <CardTitle className="text-center text-2xl font-bold tracking-tight">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </CardTitle>
            <CardDescription className="text-center text-sm text-slate-600 dark:text-zinc-200 mt-1">
              {mode === 'login'
                ? 'Sign in to continue to Mach 1 Speed'
                : 'Sign up to start your fitness journey'}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 pb-6">
            {/* Mode Toggle */}
            <div className="flex justify-center gap-2 mb-6">
              <button
                onClick={() => {
                  setMode('login')
                  setFormError(null)
                }}
                className={`px-4 py-2 rounded-full font-medium transition-colors duration-200 text-sm ${
                  mode === 'login'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-transparent text-slate-700 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-white/3'
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
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-transparent text-slate-700 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-white/3'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit(handleEmailAuth)} className="space-y-4 mb-6">
              {/* Email Field */}
              <label className="block">
                <div className="flex items-center gap-2 mb-2 text-sm text-slate-700 dark:text-zinc-200">
                  <Mail className="w-4 h-4 text-slate-400 dark:text-zinc-300" />
                  <span className="font-medium">Email</span>
                </div>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors duration-200 dark:bg-white/3 dark:text-white dark:placeholder-zinc-300 dark:border-transparent dark:focus:border-indigo-400"
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-rose-400 mt-1">{errors.email.message}</p>
                )}
              </label>

              {/* Password Field */}
              <label className="block">
                <div className="flex items-center gap-2 mb-2 text-sm text-slate-700 dark:text-zinc-200">
                  <Lock className="w-4 h-4 text-slate-400 dark:text-zinc-300" />
                  <span className="font-medium">Password</span>
                </div>
                <input
                  type="password"
                  {...register('password')}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors duration-200 dark:bg-white/3 dark:text-white dark:placeholder-zinc-300 dark:border-transparent dark:focus:border-indigo-400"
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="text-sm text-rose-400 mt-1">{errors.password.message}</p>
                )}
              </label>

              {/* Form-level Error */}
              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-900/40 dark:border-rose-700/30 dark:text-rose-200">
                  <p className="text-sm">{formError}</p>
                </div>
              )}

              {/* Submit Button */}
              <div>
                <motion.div whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
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
                <div className="w-full border-t border-slate-200 dark:border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-700 dark:bg-white/6 dark:text-zinc-300">
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
                className="w-full flex items-center justify-center gap-2 py-2"
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
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
