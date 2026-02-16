import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkoutStore } from '../stores/useWorkoutStore'
import { ExerciseCard } from '../components/workout/ExerciseCard'
import { AddExerciseModal } from '../components/workout/AddExerciseModal'
import { Button } from '@repo/ui'
import { Plus, Check } from 'lucide-react'
import { motion } from 'framer-motion'

export function ActiveWorkout() {
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const {
    currentWorkout,
    startWorkout,
    addExercise,
    removeExercise,
    addSet,
    updateSet,
    toggleSetCompleted,
    finishWorkout,
  } = useWorkoutStore()

  // Initialize workout if it doesn't exist
  useEffect(() => {
    if (!currentWorkout) {
      startWorkout()
    }
  }, [currentWorkout, startWorkout])

  // Timer
  useEffect(() => {
    if (!currentWorkout) return

    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [currentWorkout])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const handleFinish = () => {
    finishWorkout()
    // eslint-disable-next-line no-warning-comments
    // TODO: Save to Firestore
    navigate('/')
  }

  if (!currentWorkout) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Current Workout</h1>
              <p className="text-muted-foreground text-sm mt-1">
                {currentWorkout.exercises.length} exercise
                {currentWorkout.exercises.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Button onClick={handleFinish} className="gap-2 h-11" size="lg">
              <Check className="h-5 w-5" />
              Finish
            </Button>
          </div>

          {/* Live Timer */}
          <div className="flex items-center gap-3 bg-primary/10 rounded-lg p-3 border border-primary/20">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-lg font-bold text-primary">
              {formatTime(elapsedTime)}
            </span>
            <span className="text-xs text-muted-foreground ml-auto">Elapsed Time</span>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="p-4 sm:p-6 space-y-4">
        {currentWorkout.exercises.length > 0 ? (
          <motion.div layout className="space-y-4">
            {currentWorkout.exercises.map(exercise => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onRemove={() => removeExercise(exercise.id)}
                onAddSet={() => addSet(exercise.id)}
                onUpdateSet={(setId, weight, reps) => updateSet(exercise.id, setId, weight, reps)}
                onToggleSet={setId => toggleSetCompleted(exercise.id, setId)}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted p-12 text-center"
          >
            <div className="rounded-full bg-muted p-4 mb-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No exercises yet</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Tap the + button below to add your first exercise
            </p>
          </motion.div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center transition-all duration-200 hover:bg-blue-700 hover:shadow-xl active:scale-95"
      >
        <Plus className="h-8 w-8" />
      </button>

      {/* Add Exercise Modal */}
      <AddExerciseModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onAddExercise={name => addExercise(name)}
      />
    </div>
  )
}

export default ActiveWorkout
