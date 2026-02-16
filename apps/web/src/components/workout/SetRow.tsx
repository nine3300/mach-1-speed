import { Input } from '@repo/ui'
import { cn } from '@repo/ui/lib/utils'

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
    <div
      className={cn(
        'flex items-center gap-4 rounded-lg border border-transparent p-4 transition-all duration-200',
        completed
          ? 'bg-green-50 dark:bg-green-950/20'
          : 'bg-muted/30 hover:bg-muted/50 dark:bg-white/5'
      )}
    >
      {/* Set Number Badge */}
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full font-bold text-sm transition-colors',
          completed
            ? 'bg-green-500 text-white'
            : 'bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-white'
        )}
      >
        {setNumber}
      </div>

      {/* Weight Input */}
      <div className="flex-1">
        <label className="block text-xs font-medium text-muted-foreground mb-1">Weight</label>
        <div className="relative">
          <Input
            type="number"
            value={weight || ''}
            onChange={e => onWeightChange(Number(e.target.value))}
            placeholder="0"
            className={cn(
              'h-11 border-0 border-b border-input bg-transparent text-center text-lg font-semibold',
              'placeholder:text-muted-foreground focus:border-primary focus:outline-none'
            )}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground pointer-events-none">
            kg
          </span>
        </div>
      </div>

      {/* Reps Input */}
      <div className="flex-1">
        <label className="block text-xs font-medium text-muted-foreground mb-1">Reps</label>
        <div className="relative">
          <Input
            type="number"
            value={reps || ''}
            onChange={e => onRepsChange(Number(e.target.value))}
            placeholder="0"
            className={cn(
              'h-11 border-0 border-b border-input bg-transparent text-center text-lg font-semibold',
              'placeholder:text-muted-foreground focus:border-primary focus:outline-none'
            )}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground pointer-events-none">
            x
          </span>
        </div>
      </div>

      {/* Completion Checkbox */}
      <button
        onClick={onToggleComplete}
        className={cn(
          'flex h-11 w-11 items-center justify-center rounded-lg transition-all duration-200',
          completed
            ? 'bg-green-500 text-white shadow-md'
            : 'border-2 border-input hover:border-primary dark:border-white/20'
        )}
      >
        {completed && (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
    </div>
  )
}
