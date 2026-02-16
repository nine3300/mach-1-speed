import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { act } from 'react'
import type { User, Auth, NextOrObserver } from 'firebase/auth'
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

    vi.mocked(onAuthStateChanged).mockImplementation(() => {
      return () => {}
    })

    const { container } = render(<App />)
    expect(container).toBeInTheDocument()
  })

  it('should render AuthLayout when user is not authenticated', async () => {
    const { onAuthStateChanged } = await import('firebase/auth')

    vi.mocked(onAuthStateChanged).mockImplementation(
      (_auth: Auth, callback: NextOrObserver<User>) => {
        act(() => {
          if (typeof callback === 'function') {
            callback(null)
          }
        })
        return () => {}
      }
    )

    const { container } = render(<App />)

    await waitFor(
      () => {
        expect(
          container.querySelector('[class*="AuthLayout"]') || screen.queryByText(/Email/i)
        ).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })

  it('should render Dashboard when user is authenticated', async () => {
    const { onAuthStateChanged } = await import('firebase/auth')

    const mockUser = {
      uid: 'test-uid-123',
      email: 'test@example.com',
      displayName: 'Test User',
    } as User

    vi.mocked(onAuthStateChanged).mockImplementation(
      (_auth: Auth, callback: NextOrObserver<User>) => {
        act(() => {
          if (typeof callback === 'function') {
            callback(mockUser)
          }
        })
        return () => {}
      }
    )

    const { container } = render(<App />)

    await waitFor(
      () => {
        const dashboardTitle = container.querySelector('h1')
        expect(dashboardTitle?.textContent || '').toMatch(/dashboard/i)
      },
      { timeout: 3000 }
    )
  })

  it('should handle rapid auth state changes', async () => {
    const { onAuthStateChanged } = await import('firebase/auth')

    const mockUser1 = { uid: 'user-1' } as User
    const mockUser2 = { uid: 'user-2' } as User

    let capturedCallback: NextOrObserver<User> | null = null

    vi.mocked(onAuthStateChanged).mockImplementation(
      (_auth: Auth, callback: NextOrObserver<User>) => {
        capturedCallback = callback
        act(() => {
          if (typeof callback === 'function') {
            callback(mockUser1)
          }
        })
        return () => {}
      }
    )

    const { container } = render(<App />)

    await waitFor(() => {
      expect(container.querySelector('[class*="animate-spin"]')).not.toBeInTheDocument()
    })

    if (capturedCallback !== null && typeof capturedCallback === 'function') {
      const fn: (user: User | null) => void = capturedCallback
      act(() => {
        fn(mockUser2)
      })
    }

    expect(container).toBeInTheDocument()
  })
})
