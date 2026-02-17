import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Workout, Exercise, Set } from '../types/workout'
import type { UserProfile } from './db/user'

export interface FirestoreWorkout extends Omit<Workout, 'startTime' | 'endTime'> {
  startTime: Timestamp
  endTime?: Timestamp | null
  createdAt?: Timestamp
}

/**
 * Save a completed workout to Firestore
 */
export async function saveWorkout(userId: string, workout: Workout): Promise<string> {
  if (!userId) {
    throw new Error('❌ userId is required to save a workout')
  }

  if (!workout) {
    throw new Error('❌ workout object is required')
  }

  try {
    console.log('📝 Preparing to save workout for user:', userId)
    console.log('📋 Workout data:', workout)

    // Prepare workout data for Firestore (convert Date objects to Timestamps)
    const workoutData = {
      userId,
      startTime: Timestamp.fromDate(workout.startTime),
      endTime: workout.endTime ? Timestamp.fromDate(workout.endTime) : null,
      exercises: workout.exercises.map(exercise => ({
        id: exercise.id,
        name: exercise.name,
        sets: exercise.sets.map(set => ({
          id: set.id,
          setNumber: set.setNumber,
          weight: set.weight,
          reps: set.reps,
          completed: set.completed,
        })),
      })),
      completed: workout.completed,
      createdAt: Timestamp.now(),
    }

    // Add to Firestore
    const workoutsRef = collection(db, 'users', userId, 'workouts')
    console.log('📍 Firestore path:', `users/${userId}/workouts`)

    const docRef = await addDoc(workoutsRef, workoutData)

    console.log('✅ Workout saved to Firestore:', docRef.id)
    return docRef.id
  } catch (error) {
    console.error('❌ Error saving workout:', error)
    throw error
  }
}

/**
 * Get all completed workouts for a user
 */
export async function getUserWorkouts(userId: string): Promise<FirestoreWorkout[]> {
  try {
    const workoutsRef = collection(db, 'users', userId, 'workouts')
    const q = query(workoutsRef, orderBy('startTime', 'desc'))
    const snapshot = await getDocs(q)

    const workouts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as FirestoreWorkout[]

    console.log('✅ Retrieved workouts:', workouts.length)
    return workouts
  } catch (error) {
    console.error('❌ Error retrieving workouts:', error)
    throw error
  }
}

/**
 * Get workouts from a specific date range
 */
export async function getUserWorkoutsByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<FirestoreWorkout[]> {
  try {
    const workoutsRef = collection(db, 'users', userId, 'workouts')
    const q = query(
      workoutsRef,
      where('startTime', '>=', Timestamp.fromDate(startDate)),
      where('startTime', '<=', Timestamp.fromDate(endDate)),
      orderBy('startTime', 'desc')
    )
    const snapshot = await getDocs(q)

    const workouts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as FirestoreWorkout[]

    console.log('✅ Retrieved workouts for date range:', workouts.length)
    return workouts
  } catch (error) {
    console.error('❌ Error retrieving workouts by date:', error)
    throw error
  }
}

/**
 * Calculate total volume (sum of weight × reps × sets)
 */
export function calculateTotalVolume(workouts: FirestoreWorkout[]): number {
  return workouts.reduce((total, workout) => {
    const workoutVolume = workout.exercises.reduce((sum: number, exercise: Exercise) => {
      const exerciseVolume = exercise.sets.reduce((setSum: number, set: Set) => {
        return setSum + (set.completed ? set.weight * set.reps : 0)
      }, 0)
      return sum + exerciseVolume
    }, 0)
    return total + workoutVolume
  }, 0)
}

/**
 * Get workout statistics for a user
 */
export async function getWorkoutStats(userId: string) {
  try {
    const workouts = await getUserWorkouts(userId)

    const stats = {
      totalWorkouts: workouts.length,
      totalVolume: calculateTotalVolume(workouts),
      averageExercisesPerWorkout:
        workouts.length > 0
          ? Math.round(
              workouts.reduce((sum, w) => sum + (w.exercises?.length || 0), 0) / workouts.length
            )
          : 0,
      totalSetsCompleted: workouts.reduce((sum, w) => {
        const exercisesArray = w.exercises || []
        return (
          sum +
          exercisesArray.reduce((eSum: number, e: Exercise) => {
            return eSum + (e.sets ? e.sets.filter((s: Set) => s.completed).length : 0)
          }, 0)
        )
      }, 0),
    }

    return stats
  } catch (error) {
    console.error('❌ Error calculating stats:', error)
    throw error
  }
}

/**
 * Create or update user profile
 */
export async function createOrUpdateUserProfile(
  userId: string,
  userData: Partial<UserProfile>
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId)
    const now = Timestamp.now()

    // Check if user exists
    const userSnap = await getDoc(userRef)

    const profileData = {
      uid: userId,
      ...userData,
      updatedAt: now,
      ...(userSnap.exists() ? {} : { createdAt: now }),
    }

    await setDoc(userRef, profileData, { merge: true })
    console.log('✅ User profile saved:', userId)
  } catch (error) {
    console.error('❌ Error saving user profile:', error)
    throw error
  }
}

/**
 * Get user profile
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      console.log('✅ User profile retrieved:', userId)
      return userSnap.data() as UserProfile
    }

    console.log('⚠️ User profile not found:', userId)
    return null
  } catch (error) {
    console.error('❌ Error retrieving user profile:', error)
    throw error
  }
}

/**
 * Update selected workout template for user
 */
export async function updateUserWorkoutTemplate(
  userId: string,
  templateName: string
): Promise<void> {
  try {
    console.log('📝 Updating workout template for user:', userId, 'Template:', templateName)

    const userRef = doc(db, 'users', userId)
    const now = Timestamp.now()

    await setDoc(
      userRef,
      {
        selectedWorkoutTemplate: templateName,
        updatedAt: now,
      },
      { merge: true }
    )

    console.log('✅ Workout template updated:', templateName)
  } catch (error) {
    console.error('❌ Error updating workout template:', error)
    throw error
  }
}
