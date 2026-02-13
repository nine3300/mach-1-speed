/**
 * =============================================================================
 * WELCOME TO THE HYTEL WAY: MONOREPO STACK
 * =============================================================================
 */

import React from 'react'
import './style.css'

import { AuthProvider, useAuth } from './components/AuthProvider'
import { AuthForm } from './components/AuthForm'
import AuthLayout from './components/AuthLayout'
import { Header } from '@repo/ui/Header'
import { Button } from '@repo/ui/Button'
import { Loader2 } from 'lucide-react'

function AppContent() {
  const { user, loading, signOut } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <AuthLayout>
        <AuthForm />
      </AuthLayout>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <Header title="Mach 1 Speed Dashboard" />
      <div className="max-w-4xl mx-auto mt-8">
        <div className="rounded-lg border bg-card p-6 shadow">
          <h2 className="text-2xl font-semibold mb-2">Welcome, {user.email}</h2>
          <p className="text-sm text-muted-foreground mb-4">
            You are signed in and ready to train.
          </p>
          <div>
            <Button variant="destructive" onClick={() => signOut()}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
