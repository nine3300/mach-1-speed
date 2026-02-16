import React, { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from 'firebase/auth'
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { createOrUpdateUserProfile } from '../lib/firebaseService'

type AuthContextValue = {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async current => {
      setUser(current)

      // Create or update user profile in Firestore when they log in
      if (current) {
        try {
          await createOrUpdateUserProfile(current.uid, {
            email: current.email || undefined,
            displayName: current.displayName || undefined,
            photoURL: current.photoURL || undefined,
          })
        } catch (error) {
          console.error('Failed to create/update user profile:', error)
        }
      }

      setLoading(false)
    })
    return unsubscribe
  }, [])

  async function signOut() {
    await firebaseSignOut(auth)
  }

  return <AuthContext.Provider value={{ user, loading, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
