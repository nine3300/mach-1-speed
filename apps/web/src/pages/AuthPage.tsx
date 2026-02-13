import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Lock, Loader2 } from 'lucide-react'
import type { UserCredential } from 'firebase/auth'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { Button } from '@repo/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@repo/ui/Card'

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
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </CardTitle>
          <CardDescription className="text-center">
            {mode === 'login'
              ? 'Sign in to continue to Mach 1 Speed'
              : 'Sign up to start your fitness journey'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex justify-center gap-2 mb-4">
            <button
              onClick={() => setMode('login')}
              className={`px-4 py-2 rounded-md font-medium ${
                mode === 'login'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-transparent text-muted-foreground border border-input'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`px-4 py-2 rounded-md font-medium ${
                mode === 'signup'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-transparent text-muted-foreground border border-input'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit(handleAuth)} className="space-y-4">
            <label className="block">
              <div className="flex items-center gap-2 mb-1 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Email</span>
              </div>
              <input
                type="email"
                {...register('email')}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
              )}
            </label>

            <label className="block">
              <div className="flex items-center gap-2 mb-1 text-sm">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Password</span>
              </div>
              <input
                type="password"
                {...register('password')}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
              )}
            </label>

            {formError && <p className="text-sm text-destructive">{formError}</p>}

            <div className="flex items-center justify-between">
              <Button
                type="submit"
                className="flex items-center justify-center"
                disabled={submitting}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default AuthPage
