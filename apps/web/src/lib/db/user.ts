import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore'
import type { Timestamp, FieldValue } from 'firebase/firestore'
import type { User as FirebaseUser } from 'firebase/auth'
import { db } from '../firebase'

/**
 * Extended UserProfile interface with additional fields for future features
 */
export interface UserProfile {
  uid: string
  email?: string
  displayName?: string
  photoURL?: string
  selectedWorkoutTemplate?: string
  preferences?: {
    theme?: 'light' | 'dark'
    notifications?: boolean
    language?: string
  }
  onboardingCompleted?: boolean
  createdAt?: Timestamp | FieldValue
  updatedAt?: Timestamp | FieldValue
  lastLogin?: Timestamp | FieldValue
}

/**
 * Sync Firebase Auth user data to Firestore database
 *
 * This function takes a Firebase Auth User object and syncs their profile data
 * to the Firestore `users` collection. It uses `setDoc` with `merge: true` to
 * preserve any existing custom data in Firestore.
 *
 * @param user - The Firebase Auth user object
 * @throws Error if the Firestore write operation fails
 */
export async function syncUserToFirestore(user: FirebaseUser): Promise<void> {
  if (!user) {
    console.warn('⚠️ No user provided to syncUserToFirestore')
    return
  }

  try {
    const userRef = doc(db, 'users', user.uid)

    const userData: Partial<UserProfile> = {
      uid: user.uid,
      email: user.email || undefined,
      displayName: user.displayName || undefined,
      photoURL: user.photoURL || undefined,
      updatedAt: serverTimestamp(),
    }

    console.log('📝 Syncing user to Firestore:', user.uid, userData)

    // Use merge: true to avoid overwriting existing data like preferences or onboardingCompleted
    await setDoc(userRef, userData, { merge: true })

    console.log('✅ User profile synced to Firestore:', user.uid)

    // Verify the write was successful
    const verifyDoc = await getDoc(userRef)
    if (verifyDoc.exists()) {
      console.log('✅ Verification: User document exists in Firestore')
    } else {
      console.warn('⚠️ Warning: User document not found after write')
    }
  } catch (error) {
    console.error('❌ Error syncing user to Firestore:', error)
    throw error
  }
}

/**
 * Test Firestore connectivity and permissions
 * Use this for debugging if data isn't being saved
 */
export async function testFirestoreConnection(testUserId: string): Promise<boolean> {
  try {
    console.log('🧪 Testing Firestore connection for user:', testUserId)

    const testRef = doc(db, 'users', testUserId)
    const testData = {
      _test: true,
      testedAt: serverTimestamp(),
    }

    // Try to write test data
    await setDoc(testRef, testData, { merge: true }).then(() => {
      console.log('✅ Firestore write test successful')
    })

    // Try to read it back
    const testDoc = await getDoc(testRef)
    if (testDoc.exists()) {
      console.log('✅ Firestore read test successful')
      console.log('✅ Firestore connectivity confirmed')
      return true
    } else {
      console.error('❌ Firestore read test failed - document not found')
      return false
    }
  } catch (error) {
    console.error('❌ Firestore connection test failed:', error)
    return false
  }
}
export async function initializeUserProfile(user: FirebaseUser): Promise<void> {
  if (!user) {
    console.warn('⚠️ No user provided to initializeUserProfile')
    return
  }

  try {
    const userRef = doc(db, 'users', user.uid)

    const userData: UserProfile = {
      uid: user.uid,
      email: user.email || undefined,
      displayName: user.displayName || undefined,
      photoURL: user.photoURL || undefined,
      onboardingCompleted: false,
      preferences: {
        theme: 'dark',
        notifications: true,
        language: 'en',
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    console.log('📝 Initializing user profile:', user.uid, userData)

    // Use merge: true so we don't overwrite if user already exists
    await setDoc(userRef, userData, { merge: true })

    console.log('✅ User profile initialized:', user.uid)

    // Verify the write was successful
    const verifyDoc = await getDoc(userRef)
    if (verifyDoc.exists()) {
      console.log('✅ Verification: User document created/updated in Firestore', verifyDoc.data())
    } else {
      console.warn('⚠️ Warning: User document not found after initialization')
    }
  } catch (error) {
    console.error('❌ Error initializing user profile:', error)
    throw error
  }
}
