import { useState } from 'react'
import { Button } from '@repo/ui'
import { Input } from '@repo/ui'
import { Search } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui/components/ui/dialog'

const COMMON_EXERCISES = [
  'Bench Press',
  'Squat',
  'Deadlift',
  'Barbell Row',
  'Overhead Press',
  'Pull-ups',
  'Dumbbell Curl',
  'Tricep Dips',
  'Leg Press',
  'Leg Curl',
  'Lat Pulldown',
  'Cable Fly',
  'Incline Dumbbell Press',
  'Romanian Deadlift',
  'Barbell Curl',
]

interface AddExerciseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddExercise: (name: string) => void
}

export function AddExerciseModal({ open, onOpenChange, onAddExercise }: AddExerciseModalProps) {
  const [search, setSearch] = useState('')
  const [customName, setCustomName] = useState('')

  const filteredExercises = COMMON_EXERCISES.filter(exercise =>
    exercise.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelectExercise = (name: string) => {
    onAddExercise(name)
    setSearch('')
    setCustomName('')
    onOpenChange(false)
  }

  const handleAddCustom = () => {
    if (customName.trim()) {
      onAddExercise(customName.trim())
      setCustomName('')
      setSearch('')
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Exercise</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search exercises..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 h-11"
            />
          </div>

          {/* Common Exercises Grid */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Common Exercises</p>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {filteredExercises.map(exercise => (
                <Button
                  key={exercise}
                  variant="outline"
                  className="h-12 text-sm justify-start"
                  onClick={() => handleSelectExercise(exercise)}
                >
                  {exercise}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Exercise */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Custom Exercise</p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter exercise name..."
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                className="h-11"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleAddCustom()
                  }
                }}
              />
              <Button onClick={handleAddCustom} className="h-11 px-4">
                Add
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
