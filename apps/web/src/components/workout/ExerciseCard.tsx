import { X, Plus } from 'lucide-react'
import { SetRow } from './SetRow'
import { motion } from 'framer-motion'
import type { Exercise } from '../../types/workout'

interface ExerciseCardProps {
  exercise: Exercise
  onRemove: () => void
  onAddSet: () => void
  onUpdateSet: (setId: string, weight: number, reps: number) => void
  onToggleSet: (setId: string) => void
}

export function ExerciseCard({
  exercise,
  onRemove,
  onAddSet,
  onUpdateSet,
  onToggleSet,
}: ExerciseCardProps) {
  const completedSets = exercise.sets.filter(s => s.completed).length
  const completionPercent =
    exercise.sets.length > 0 ? (completedSets / exercise.sets.length) * 100 : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      layout
    >
      <div className="relative overflow-hidden rounded-xl border border-[#2A3142] bg-[#1A1F2E] shadow-md hover:shadow-lg transition-all duration-300">
        {/* Card Header with Progress */}
        <div className="flex flex-row items-start justify-between p-4 pb-3 relative">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white">{exercise.name}</h3>
            <p className="text-xs text-[#9CA3AF] mt-1">
              {completedSets}/{exercise.sets.length} sets completed
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRemove}
            className="h-9 w-9 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors flex items-center justify-center"
          >
            <X className="h-5 w-5" />
          </motion.button>
        </div>

        {/* Progress Bar */}
        {exercise.sets.length > 0 && (
          <div className="px-4 pb-3">
            <div className="relative h-1.5 rounded-full bg-[#2A3142] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPercent}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full bg-[#CCFF00] rounded-full"
              />
            </div>
          </div>
        )}

        <div className="space-y-2 p-4">
          {/* Sets List */}
          {exercise.sets.length > 0 ? (
            <div className="space-y-2">
              {exercise.sets.map((set, idx) => (
                <motion.div
                  key={set.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                >
                  <SetRow
                    setNumber={set.setNumber}
                    weight={set.weight}
                    reps={set.reps}
                    completed={set.completed}
                    onWeightChange={weight => onUpdateSet(set.id, weight, set.reps)}
                    onRepsChange={reps => onUpdateSet(set.id, set.weight, reps)}
                    onToggleComplete={() => onToggleSet(set.id)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex h-16 items-center justify-center rounded-lg bg-[#1A1F2E] text-center border border-dashed border-[#2A3142]">
              <p className="text-sm text-[#9CA3AF]">No sets yet. Add one to get started!</p>
            </div>
          )}

          {/* Add Set Button */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <button
              className="w-full h-11 gap-2 mt-2 text-[#CCFF00] hover:bg-[#CCFF00]/10 font-semibold transition-all rounded-lg flex items-center justify-center border border-[#CCFF00]/30 hover:border-[#CCFF00]/50"
              onClick={onAddSet}
            >
              <Plus className="h-5 w-5" />
              Add Set
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
