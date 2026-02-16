import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { act } from 'react'
import type { User } from 'firebase/auth'
import type { Auth } from 'firebase/auth'
import { App } from './App'

// Mock Firebase auth module
vi.mock('./lib/firebase', () => ({
  auth: {},
}))

// Mock Firebase auth functions
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
  signOut: vi.fn(),
  GoogleAuthProvider: vi.fn(),
}))

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the app without crashing', async () => {
    const { onAuthStateChanged } = await import('firebase/auth')

    // Mock the onAuthStateChanged to simulate loading state
    vi.mocked(onAuthStateChanged).mockImplementation((_auth: Auth, _callback) => {
      // Simulate delayed auth state update (like real Firebase)
      return () => {} // Return unsubscribe function
    })

    const { container } = render(<App />)

    // Check that the app renders without errors
    expect(container).toBeInTheDocument()
  })

  it('should render AuthLayout when user is not authenticated', async () => {
    const { onAuthStateChanged } = await import('firebase/auth')

    // Mock onAuthStateChanged to resolve to null (not authenticated)
    vi.mocked(onAuthStateChanged).mockImplementation((_auth: Auth, callback) => {
      // Use act to wrap the state update
      act(() => {
        callback(null)
      })
      return () => {} // Return unsubscribe function
    })

    const { container } = render(<App />)

    // Wait for the auth form to appear (no longer in loading state)
    await waitFor(
      () => {
        // Check for the auth form container which is unique to the auth page
        expect(
          container.querySelector('[class*="AuthLayout"]') || screen.queryByText(/Email/i)
        ).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })

  it('should render Dashboard when user is authenticated', async () => {
    const { onAuthStateChanged } = await import('firebase/auth')

    // Mock a user object
    const mockUser: Partial<User> = {
      uid: 'test-uid-123',
      email: 'test@example.com',
      displayName: 'Test User',
    }

    // Mock onAuthStateChanged to resolve to an authenticated user
    vi.mocked(onAuthStateChanged).mockImplementation((_auth: Auth, callback) => {
      // Use act to wrap the state update
      act(() => {
        callback(mockUser as User)
      })
      return () => {} // Return unsubscribe function
    })

    const { container } = render(<App />)

    // Wait for the Dashboard to appear (Dashboard contains "Dashboard" in h1)
    await waitFor(
      () => {
        // Check for Dashboard heading or Quick Access section which is unique to dashboard
        const dashboardTitle = container.querySelector('h1')
        expect(dashboardTitle?.textContent || '').toMatch(/dashboard/i)
      },
      { timeout: 3000 }
    )
  })

  it('should handle rapid auth state changes', async () => {
    const { onAuthStateChanged } = await import('firebase/auth')

    const mockUser1: Partial<User> = {
      uid: 'user-1',
      email: 'user1@example.com',
    }

    const mockUser2: Partial<User> = {
      uid: 'user-2',
      email: 'user2@example.com',
    }

    let authCallback: ((user: User | null) => void) | null = null

    vi.mocked(onAuthStateChanged).mockImplementation((_auth: Auth, callback) => {
      authCallback = callback
      act(() => {
        callback(mockUser1 as User)
      })
      return () => {} // Return unsubscribe function
    })

    const { container } = render(<App />)

    // Wait for initial render
    await waitFor(() => {
      expect(container.querySelector('[class*="animate-spin"]')).not.toBeInTheDocument()
    })

    // Simulate rapid auth changes
    if (authCallback) {
      act(() => {
        authCallback!(mockUser2 as User)
      })
    }

    // App should still be stable
    expect(container).toBeInTheDocument()
  })
})
