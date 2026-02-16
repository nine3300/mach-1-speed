import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Workout, Exercise, Set } from '../types/workout'

interface WorkoutState {
  currentWorkout: Workout | null
  startWorkout: () => void
  addExercise: (name: string) => void
  removeExercise: (exerciseId: string) => void
  addSet: (exerciseId: string) => void
  updateSet: (exerciseId: string, setId: string, weight: number, reps: number) => void
  toggleSetCompleted: (exerciseId: string, setId: string) => void
  finishWorkout: () => Workout | null
  clearWorkout: () => void
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      currentWorkout: null,

      startWorkout: () => {
        const newWorkout: Workout = {
          id: crypto.randomUUID(),
          userId: '',
          startTime: new Date(),
          exercises: [],
          completed: false,
        }
        set({ currentWorkout: newWorkout })
      },

      addExercise: (name: string) => {
        set(state => {
          if (!state.currentWorkout) return state
          const newExercise: Exercise = {
            id: crypto.randomUUID(),
            name,
            sets: [],
          }
          return {
            currentWorkout: {
              ...state.currentWorkout,
              exercises: [...state.currentWorkout.exercises, newExercise],
            },
          }
        })
      },

      removeExercise: (exerciseId: string) => {
        set(state => {
          if (!state.currentWorkout) return state
          return {
            currentWorkout: {
              ...state.currentWorkout,
              exercises: state.currentWorkout.exercises.filter(ex => ex.id !== exerciseId),
            },
          }
        })
      },

      addSet: (exerciseId: string) => {
        set(state => {
          if (!state.currentWorkout) return state
          return {
            currentWorkout: {
              ...state.currentWorkout,
              exercises: state.currentWorkout.exercises.map(exercise => {
                if (exercise.id !== exerciseId) return exercise
                const newSet: Set = {
                  id: crypto.randomUUID(),
                  setNumber: exercise.sets.length + 1,
                  weight: 0,
                  reps: 0,
                  completed: false,
                }
                return {
                  ...exercise,
                  sets: [...exercise.sets, newSet],
                }
              }),
            },
          }
        })
      },

      updateSet: (exerciseId: string, setId: string, weight: number, reps: number) => {
        set(state => {
          if (!state.currentWorkout) return state
          return {
            currentWorkout: {
              ...state.currentWorkout,
              exercises: state.currentWorkout.exercises.map(exercise => {
                if (exercise.id !== exerciseId) return exercise
                return {
                  ...exercise,
                  sets: exercise.sets.map(s => (s.id === setId ? { ...s, weight, reps } : s)),
                }
              }),
            },
          }
        })
      },

      toggleSetCompleted: (exerciseId: string, setId: string) => {
        set(state => {
          if (!state.currentWorkout) return state
          return {
            currentWorkout: {
              ...state.currentWorkout,
              exercises: state.currentWorkout.exercises.map(exercise => {
                if (exercise.id !== exerciseId) return exercise
                return {
                  ...exercise,
                  sets: exercise.sets.map(s =>
                    s.id === setId ? { ...s, completed: !s.completed } : s
                  ),
                }
              }),
            },
          }
        })
      },

      finishWorkout: () => {
        const state = get()
        if (!state.currentWorkout) return null
        const finished: Workout = {
          ...state.currentWorkout,
          endTime: new Date(),
          completed: true,
        }
        set({ currentWorkout: null })
        return finished
      },

      clearWorkout: () => {
        set({ currentWorkout: null })
      },
    }),
    {
      name: 'workout-store',
    }
  )
)
