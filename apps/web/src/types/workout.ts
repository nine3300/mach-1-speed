export interface Set {
  id: string
  setNumber: number
  weight: number
  reps: number
  completed: boolean
}

export interface Exercise {
  id: string
  name: string
  sets: Set[]
}

export interface Workout {
  id: string
  userId: string
  startTime: Date
  endTime?: Date
  exercises: Exercise[]
  completed: boolean
}
