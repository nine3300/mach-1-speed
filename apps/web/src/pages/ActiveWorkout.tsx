import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkoutStore } from '../stores/useWorkoutStore'
import { useAuth } from '../components/AuthProvider'
import { ExerciseCard } from '../components/workout/ExerciseCard'
import { AddExerciseModal } from '../components/workout/AddExerciseModal'
import { Plus, Check, Play, Pause, Square } from 'lucide-react'
import { motion } from 'framer-motion'
import { saveWorkout } from '../lib/firebaseService'
import type { Workout } from '../types/workout'

export function ActiveWorkout() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [durationInput, setDurationInput] = useState('0:00')
  const [remaining, setRemaining] = useState(0)
  const [saving, setSaving] = useState(false)
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

  // Countdown timer: runs only when started
  useEffect(() => {
    if (!currentWorkout || !isRunning) return
    const interval = setInterval(() => {
      setRemaining(prev => {
        const next = prev - 1
        if (next <= 0) {
          setIsRunning(false)
          return 0
        }
        return next
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [currentWorkout, isRunning])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const parseDuration = (value: string) => {
    const parts = value.split(':').map(p => p.trim())
    if (parts.length === 1) {
      const m = parseInt(parts[0] || '0', 10)
      return Number.isFinite(m) ? m * 60 : 0
    }
    if (parts.length === 2) {
      const m = parseInt(parts[0] || '0', 10)
      const s = parseInt(parts[1] || '0', 10)
      return (Number.isFinite(m) ? m : 0) * 60 + (Number.isFinite(s) ? s : 0)
    }
    if (parts.length === 3) {
      const h = parseInt(parts[0] || '0', 10)
      const m = parseInt(parts[1] || '0', 10)
      const s = parseInt(parts[2] || '0', 10)
      return (
        (Number.isFinite(h) ? h : 0) * 3600 +
        (Number.isFinite(m) ? m : 0) * 60 +
        (Number.isFinite(s) ? s : 0)
      )
    }
    return 0
  }

  const applyDuration = () => {
    const seconds = parseDuration(durationInput)
    setRemaining(seconds)
  }

  const handleFinish = async () => {
    if (!user || !currentWorkout?.id) {
      console.error('❌ Cannot save workout - Missing user or workout ID')
      console.log('User:', user?.uid)
      console.log('Workout ID:', currentWorkout?.id)
      return
    }

    try {
      setSaving(true)
      console.log('💾 Starting workout save process...')
      console.log('User ID:', user.uid)
      console.log('Workout ID:', currentWorkout.id)
      console.log('Number of exercises:', currentWorkout.exercises.length)

      // Create the final workout object with end time
      const finalWorkout: Workout = {
        ...currentWorkout,
        endTime: new Date(),
        completed: true,
        userId: user.uid,
      } as Workout

      console.log('📋 Final workout object:', finalWorkout)

      // Save to Firestore
      const savedId = await saveWorkout(user.uid, finalWorkout)
      console.log('✅ Workout saved successfully with ID:', savedId)

      // Clear the store
      finishWorkout()

      // Navigate back to dashboard
      navigate('/')
    } catch (error) {
      console.error('❌ Failed to save workout:', error)
      // Still navigate back even if save fails (workout was in progress)
      finishWorkout()
      navigate('/')
    } finally {
      setSaving(false)
    }
  }

  if (!currentWorkout) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-[#0F1419] pb-24">
      {/* Sticky Header with Dark Theme Styling */}
      <div className="sticky top-0 z-40 border-b border-[#2A3142] bg-[#0F1419]/80 backdrop-blur-xl">
        <div className="p-4 sm:p-6">
          {/* Title & Finish Button Row */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white">Current Workout</h1>
              <p className="text-[#9CA3AF] text-sm mt-1">
                {currentWorkout.exercises.length} exercise
                {currentWorkout.exercises.length !== 1 ? 's' : ''} •
                <span className="font-semibold text-white ml-1">
                  {currentWorkout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)} sets
                </span>
              </p>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button
                onClick={handleFinish}
                disabled={saving}
                className="gap-2 h-12 px-6 bg-[#CCFF00] hover:bg-[#BBFF00] text-[#0F1419] font-bold shadow-lg hover:shadow-xl transition-all rounded-lg flex items-center justify-center disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-[#0F1419] border-t-transparent rounded-full" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5" />
                    Finish
                  </>
                )}
              </button>
            </motion.div>
          </div>

          {/* Hero Timer Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-2xl bg-[#1A1F2E] p-6 border border-[#2A3142] shadow-xl"
          >
            {/* Subtle lime-green glow */}
            <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-[#CCFF00]/5 blur-3xl -top-16 -right-16" />
            <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-[#CCFF00]/5 blur-3xl -bottom-16 -left-16" />

            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#9CA3AF] mb-2">⏱ ELAPSED TIME</p>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-5xl font-black tracking-tighter text-[#CCFF00]">
                    {formatTime(remaining)}
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <input
                    aria-label="Set workout duration"
                    value={durationInput}
                    onChange={e => setDurationInput(e.target.value)}
                    onBlur={applyDuration}
                    className="w-28 rounded-md bg-[#0F1419] border border-[#2A3142] px-3 py-2 text-white placeholder-[#9CA3AF] text-sm"
                    placeholder="mm:ss"
                  />
                  <button
                    onClick={applyDuration}
                    className="px-3 py-2 rounded-md bg-[#2A3142] text-white text-sm hover:bg-[#3A4152]"
                  >
                    Set
                  </button>
                  {isRunning ? (
                    <button
                      onClick={() => setIsRunning(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-md bg-[#CCFF00] text-[#0F1419] font-bold hover:bg-[#BBFF00]"
                    >
                      <Pause className="h-4 w-4" />
                      Pause
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (remaining === 0) applyDuration()
                        setIsRunning(true)
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-md bg-[#CCFF00] text-[#0F1419] font-bold hover:bg-[#BBFF00]"
                    >
                      <Play className="h-4 w-4" />
                      Start
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsRunning(false)
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-md bg-[#1A1F2E] border border-[#2A3142] text-white text-sm hover:bg-[#22283a]"
                  >
                    <Square className="h-4 w-4" />
                    Stop
                  </button>
                </div>
              </div>

              {/* Pulsing indicator */}
              <motion.div
                animate={isRunning ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex flex-col items-center"
              >
                <motion.div
                  animate={isRunning ? { opacity: [0.5, 1, 0.5] } : { opacity: 0.5 }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`h-4 w-4 rounded-full ${isRunning ? 'bg-[#CCFF00]' : 'bg-[#9CA3AF]'}`}
                />
                <p
                  className={`text-xs mt-2 font-bold ${isRunning ? 'text-[#CCFF00]/70' : 'text-[#9CA3AF]'}`}
                >
                  {isRunning ? 'LIVE' : 'PAUSED'}
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="p-4 sm:p-6 space-y-4">
        {currentWorkout.exercises.length > 0 ? (
          <motion.div layout className="space-y-3">
            {currentWorkout.exercises.map((exercise, idx) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
              >
                <ExerciseCard
                  exercise={exercise}
                  onRemove={() => removeExercise(exercise.id)}
                  onAddSet={() => addSet(exercise.id)}
                  onUpdateSet={(setId, weight, reps) => updateSet(exercise.id, setId, weight, reps)}
                  onToggleSet={setId => toggleSetCompleted(exercise.id, setId)}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#2A3142] bg-[#1A1F2E]/30 p-12 text-center mt-8"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="rounded-full bg-[#CCFF00]/10 p-6 mb-4"
            >
              <Plus className="h-10 w-10 text-[#CCFF00]" />
            </motion.div>
            <h3 className="font-bold text-lg text-white mb-2">No exercises yet</h3>
            <p className="text-[#9CA3AF] text-sm mb-4">
              Tap the + button below to add your first exercise
            </p>
          </motion.div>
        )}
      </div>

      {/* Enhanced Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1, boxShadow: '0 20px 50px rgba(204, 255, 0, 0.4)' }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setModalOpen(true)}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-[#CCFF00] text-[#0F1419] shadow-2xl flex items-center justify-center transition-all duration-200 hover:shadow-2xl active:shadow-lg z-50"
      >
        <Plus className="h-8 w-8 stroke-[3]" />
      </motion.button>

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
