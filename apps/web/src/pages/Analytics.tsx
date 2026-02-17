import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../components/AuthProvider'
import { getUserWorkouts } from '../lib/firebaseService'
import type { FirestoreWorkout } from '../lib/firebaseService'
import { motion } from 'framer-motion'
import { Brain, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type Goal = 'lose_weight' | 'build_muscle'

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function Analytics() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [workouts, setWorkouts] = useState<FirestoreWorkout[]>([])
  const [goal, setGoal] = useState<Goal>('lose_weight')

  useEffect(() => {
    async function load() {
      if (!user) return
      setLoading(true)
      const data = await getUserWorkouts(user.uid)
      setWorkouts(data)
      setLoading(false)
    }
    load()
  }, [user])

  const stats = useMemo(() => {
    if (workouts.length === 0) {
      return {
        avgDuration: 0,
        avgExercises: 0,
        avgSetsPerExercise: 0,
        avgRepsPerSet: 0,
        exerciseAverages: {} as Record<string, { avgWeight: number; samples: number }>,
      }
    }

    let durationSum = 0
    let exerciseCount = 0
    let setsCount = 0
    let repsSum = 0
    const exerciseWeights: Record<string, { sum: number; samples: number }> = {}

    workouts.forEach(w => {
      const start = w.startTime.toDate()
      const end = w.endTime ? w.endTime.toDate() : null
      if (end) {
        durationSum += Math.max(0, Math.round((end.getTime() - start.getTime()) / 1000))
      }
      const exs = w.exercises || []
      exerciseCount += exs.length
      exs.forEach(ex => {
        const sets = ex.sets || []
        setsCount += sets.length
        sets.forEach(s => {
          repsSum += s.reps || 0
          const key = ex.name
          const weight = s.weight || 0
          if (!exerciseWeights[key]) {
            exerciseWeights[key] = { sum: 0, samples: 0 }
          }
          if (s.completed) {
            exerciseWeights[key].sum += weight
            exerciseWeights[key].samples += 1
          }
        })
      })
    })

    const avgDuration = Math.round(durationSum / Math.max(1, workouts.length))
    const avgExercises = Math.round(exerciseCount / Math.max(1, workouts.length))
    const avgSetsPerExercise = Math.round(setsCount / Math.max(1, exerciseCount || 1))
    const avgRepsPerSet = Math.round(repsSum / Math.max(1, setsCount || 1))

    const exerciseAverages = Object.fromEntries(
      Object.entries(exerciseWeights).map(([name, { sum, samples }]) => [
        name,
        { avgWeight: samples > 0 ? Math.round((sum / samples) * 10) / 10 : 0, samples },
      ])
    )

    return { avgDuration, avgExercises, avgSetsPerExercise, avgRepsPerSet, exerciseAverages }
  }, [workouts])

  const recommendations = useMemo(() => {
    const { avgDuration, avgExercises, avgSetsPerExercise, avgRepsPerSet, exerciseAverages } = stats
    if (workouts.length === 0) {
      return {
        sessionDuration: goal === 'lose_weight' ? 30 * 60 : 45 * 60,
        targetReps: goal === 'lose_weight' ? '12–20' : '6–12',
        targetSets: goal === 'lose_weight' ? '3–4' : '3–5',
        rest: goal === 'lose_weight' ? '45–60s' : '60–90s',
        exerciseWeights: Object.entries(exerciseAverages).map(([name, v]) => ({
          name,
          recommendedWeight: v.avgWeight,
          basis: 'avg',
        })),
        notes:
          goal === 'lose_weight'
            ? 'Prioritize total work and short rests; keep heart rate elevated.'
            : 'Aim for progressive overload; increase load gradually while maintaining form.',
      }
    }

    const baseDuration = avgDuration || (goal === 'lose_weight' ? 30 * 60 : 45 * 60)
    const sessionDuration =
      goal === 'lose_weight'
        ? Math.max(25 * 60, Math.min(60 * 60, Math.round(baseDuration * 0.95)))
        : Math.max(40 * 60, Math.min(75 * 60, Math.round(baseDuration * 1.05)))

    const targetReps = goal === 'lose_weight' ? '12–20' : '6–12'
    const targetSets = goal === 'lose_weight' ? '3–4' : '3–5'
    const rest = goal === 'lose_weight' ? '45–60s' : '60–90s'

    const exerciseWeights = Object.entries(exerciseAverages).map(([name, v]) => {
      const avg = v.avgWeight || 0
      const delta = goal === 'lose_weight' ? -0.1 : 0.05
      const rec = Math.max(0, Math.round(avg * (1 + delta) * 2) / 2) // round to 0.5
      return {
        name,
        recommendedWeight: rec,
        basis: avg > 0 ? 'avg adjusted' : 'default',
      }
    })

    const notes =
      goal === 'lose_weight'
        ? `Based on your history (avg ${avgExercises} exercises, ${avgSetsPerExercise} sets/exercise, ${avgRepsPerSet} reps/set), emphasize higher reps and shorter rest. Keep intensity steady.`
        : `Based on your history (avg ${avgExercises} exercises, ${avgSetsPerExercise} sets/exercise, ${avgRepsPerSet} reps/set), target progressive overload with controlled reps and longer rest.`

    return { sessionDuration, targetReps, targetSets, rest, exerciseWeights, notes }
  }, [goal, stats, workouts.length])

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#0F1419] p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-6 w-6 text-[#CCFF00]" />
          <h1 className="text-3xl font-black tracking-tight text-white">
            Analytics & Recommendations
          </h1>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="h-10 px-4 bg-[#1A1F2E] border border-[#2A3142] text-[#9CA3AF] rounded-lg hover:text-white transition-all font-semibold"
        >
          Back to Dashboard
        </motion.button>
      </div>

      <div className="rounded-2xl bg-[#1A1F2E] border border-[#2A3142] p-6 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm text-[#9CA3AF]">Goal</label>
          <div className="flex gap-2">
            <button
              onClick={() => setGoal('lose_weight')}
              className={`px-4 py-2 rounded-lg text-sm ${
                goal === 'lose_weight'
                  ? 'bg-[#CCFF00] text-black'
                  : 'bg-[#0F1419] border border-[#2A3142] text-[#9CA3AF]'
              }`}
            >
              Lose Weight
            </button>
            <button
              onClick={() => setGoal('build_muscle')}
              className={`px-4 py-2 rounded-lg text-sm ${
                goal === 'build_muscle'
                  ? 'bg-[#CCFF00] text-black'
                  : 'bg-[#0F1419] border border-[#2A3142] text-[#9CA3AF]'
              }`}
            >
              Build Muscle
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="rounded-2xl bg-[#1A1F2E] border border-[#2A3142] p-6">
          {loading ? (
            <div className="p-10 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#CCFF00]" />
            </div>
          ) : workouts.length === 0 ? (
            <p className="text-[#9CA3AF]">
              No workouts yet. Complete a workout and press Finish to see analytics.
            </p>
          ) : (
            <div className="space-y-3 text-sm text-[#9CA3AF]">
              <div>
                <span className="text-white font-semibold">{workouts.length}</span> workouts
                analyzed
              </div>
              <div>
                Avg session duration:{' '}
                <span className="text-white font-mono">{formatDuration(stats.avgDuration)}</span>
              </div>
              <div>
                Avg exercises per workout:{' '}
                <span className="text-white font-semibold">{stats.avgExercises}</span>
              </div>
              <div>
                Avg sets / exercise:{' '}
                <span className="text-white font-semibold">{stats.avgSetsPerExercise}</span>
              </div>
              <div>
                Avg reps / set:{' '}
                <span className="text-white font-semibold">{stats.avgRepsPerSet}</span>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-[#1A1F2E] border border-[#2A3142] p-6">
          <h2 className="text-white font-bold mb-3">Recommended Plan</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm text-[#9CA3AF]">
            <div>
              Session duration:{' '}
              <span className="text-white font-mono">
                {formatDuration(recommendations.sessionDuration)}
              </span>
            </div>
            <div>
              Sets per exercise:{' '}
              <span className="text-white font-semibold">{recommendations.targetSets}</span>
            </div>
            <div>
              Reps range:{' '}
              <span className="text-white font-semibold">{recommendations.targetReps}</span>
            </div>
            <div>
              Rest between sets:{' '}
              <span className="text-white font-semibold">{recommendations.rest}</span>
            </div>
          </div>
          <p className="text-xs mt-3 text-[#9CA3AF]">{recommendations.notes}</p>
        </div>

        <div className="rounded-2xl bg-[#1A1F2E] border border-[#2A3142]">
          <div className="p-6">
            <h3 className="text-white font-bold mb-3">Per-Exercise Weight Guidance</h3>
            {recommendations.exerciseWeights.length === 0 ? (
              <p className="text-[#9CA3AF] text-sm">No exercise data yet.</p>
            ) : (
              <ul className="divide-y divide-[#2A3142]">
                {recommendations.exerciseWeights.map(item => (
                  <li key={item.name} className="py-3 flex items-center justify-between">
                    <span className="text-white">{item.name}</span>
                    <span className="text-[#CCFF00] font-mono">{item.recommendedWeight} kg</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
