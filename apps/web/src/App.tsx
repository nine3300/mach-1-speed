/**
 * =============================================================================
 * WELCOME TO THE HYTEL WAY: MONOREPO STACK
 * =============================================================================
 */

import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './style.css'

import { AuthProvider, useAuth } from './components/AuthProvider'
import { AuthForm } from './components/AuthForm'
import AuthLayout from './components/AuthLayout'
import { Dashboard } from './pages/Dashboard'
import ActiveWorkout from './pages/ActiveWorkout'
import { Loader2 } from 'lucide-react'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function AppContent() {
  const { user, loading } = useAuth()

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
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route
        path="/active-workout"
        element={
          <ProtectedRoute>
            <ActiveWorkout />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  )
}
