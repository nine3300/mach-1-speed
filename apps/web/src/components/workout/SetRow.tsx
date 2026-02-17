import { Input } from '@repo/ui'
import { cn } from '@repo/ui/lib/utils'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface SetRowProps {
  setNumber: number
  weight: number
  reps: number
  completed: boolean
  onWeightChange: (weight: number) => void
  onRepsChange: (reps: number) => void
  onToggleComplete: () => void
}

export function SetRow({
  setNumber,
  weight,
  reps,
  completed,
  onWeightChange,
  onRepsChange,
  onToggleComplete,
}: SetRowProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex items-center gap-3 rounded-xl border-2 p-4 transition-all duration-300',
        completed
          ? 'border-[#CCFF00]/50 bg-[#CCFF00]/5'
          : 'border-[#2A3142] bg-[#1A1F2E] hover:border-[#CCFF00]/30'
      )}
    >
      {/* Set Number Badge */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        className={cn(
          'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full font-bold text-sm transition-all duration-300',
          completed
            ? 'bg-[#CCFF00] text-[#0F1419] shadow-lg shadow-[#CCFF00]/20'
            : 'bg-[#2A3142] text-[#9CA3AF]'
        )}
      >
        {completed ? <Check className="h-5 w-5" /> : setNumber}
      </motion.div>

      {/* Weight Input */}
      <div className="flex-1">
        <label className="block text-xs font-semibold text-[#9CA3AF] mb-1 uppercase tracking-wider">
          Weight
        </label>
        <div className="relative">
          <Input
            type="number"
            value={weight || ''}
            onChange={e => onWeightChange(Number(e.target.value))}
            placeholder="0"
            className={cn(
              'h-10 border-0 border-b-2 bg-transparent text-center text-lg font-bold',
              completed
                ? 'border-b-[#CCFF00] text-[#CCFF00]'
                : 'border-b-[#2A3142] text-white placeholder:text-[#9CA3AF] focus:border-b-[#CCFF00]',
              'focus:outline-none transition-all duration-200'
            )}
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-[#9CA3AF] pointer-events-none">
            kg
          </span>
        </div>
      </div>

      {/* Reps Input */}
      <div className="flex-1">
        <label className="block text-xs font-semibold text-[#9CA3AF] mb-1 uppercase tracking-wider">
          Reps
        </label>
        <div className="relative">
          <Input
            type="number"
            value={reps || ''}
            onChange={e => onRepsChange(Number(e.target.value))}
            placeholder="0"
            className={cn(
              'h-10 border-0 border-b-2 bg-transparent text-center text-lg font-bold',
              completed
                ? 'border-b-[#CCFF00] text-[#CCFF00]'
                : 'border-b-[#2A3142] text-white placeholder:text-[#9CA3AF] focus:border-b-[#CCFF00]',
              'focus:outline-none transition-all duration-200'
            )}
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-[#9CA3AF] pointer-events-none">
            x
          </span>
        </div>
      </div>

      {/* Completion Checkbox */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onToggleComplete}
        className={cn(
          'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg font-bold transition-all duration-300',
          completed
            ? 'bg-[#CCFF00] text-[#0F1419] shadow-lg shadow-[#CCFF00]/20'
            : 'border-2 border-[#2A3142] hover:border-[#CCFF00]'
        )}
      >
        {completed && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <Check className="h-5 w-5" />
          </motion.div>
        )}
      </motion.button>
    </motion.div>
  )
}
