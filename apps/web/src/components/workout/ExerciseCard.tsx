import { Card, CardHeader, CardTitle, CardContent, Button } from '@repo/ui'
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-bold">{exercise.name}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Sets List */}
          {exercise.sets.length > 0 ? (
            <div className="space-y-2">
              {exercise.sets.map(set => (
                <SetRow
                  key={set.id}
                  setNumber={set.setNumber}
                  weight={set.weight}
                  reps={set.reps}
                  completed={set.completed}
                  onWeightChange={weight => onUpdateSet(set.id, weight, set.reps)}
                  onRepsChange={reps => onUpdateSet(set.id, set.weight, reps)}
                  onToggleComplete={() => onToggleSet(set.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-16 items-center justify-center rounded-lg bg-muted/30 text-center">
              <p className="text-sm text-muted-foreground">No sets yet. Add one to get started!</p>
            </div>
          )}

          {/* Add Set Button */}
          <Button
            variant="ghost"
            className="w-full h-11 gap-2 mt-2 text-primary hover:bg-primary/10"
            onClick={onAddSet}
          >
            <Plus className="h-5 w-5" />
            Add Set
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
