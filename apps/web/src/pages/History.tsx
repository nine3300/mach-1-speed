import { useEffect, useState } from 'react'
import { useAuth } from '../components/AuthProvider'
import { getUserWorkouts, calculateTotalVolume } from '../lib/firebaseService'
import type { FirestoreWorkout } from '../lib/firebaseService'
import { motion } from 'framer-motion'
import { Loader2, CalendarDays } from 'lucide-react'
import type { Timestamp as _Timestamp } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'

export function History() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [workouts, setWorkouts] = useState<FirestoreWorkout[]>([])

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

  if (!user) {
    return null
  }

  const totalVolume = calculateTotalVolume(workouts)

  return (
    <div className="min-h-screen bg-[#0F1419] p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-6 w-6 text-[#CCFF00]" />
          <h1 className="text-3xl font-black tracking-tight text-white">Workout History</h1>
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

      <div className="grid gap-6">
        <div className="rounded-2xl bg-[#1A1F2E] border border-[#2A3142] p-6">
          <div className="flex flex-wrap gap-4 text-sm text-[#9CA3AF]">
            <div>
              <span className="font-semibold text-white">{workouts.length}</span> workouts
            </div>
            <div>
              <span className="font-semibold text-white">{totalVolume}</span> total volume
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[#1A1F2E] border border-[#2A3142]">
          {loading ? (
            <div className="p-10 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#CCFF00]" />
            </div>
          ) : workouts.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-[#9CA3AF]">No workouts yet</p>
            </div>
          ) : (
            <ul className="divide-y divide-[#2A3142]">
              {workouts.map(w => {
                const start = w.startTime.toDate()
                const end = w.endTime ? w.endTime.toDate() : null
                const duration =
                  end && start
                    ? Math.max(0, Math.round((end.getTime() - start.getTime()) / 1000))
                    : 0
                const setsCompleted =
                  (w.exercises || []).reduce((sum, ex) => {
                    return sum + (ex.sets || []).filter(s => s.completed).length
                  }, 0) || 0
                return (
                  <li key={w.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold">
                          {start.toLocaleDateString()} •{' '}
                          {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-[#9CA3AF] text-sm">
                          {(w.exercises || []).length} exercises • {setsCompleted} sets completed
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[#CCFF00] font-mono">
                          {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}
                        </p>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default History
