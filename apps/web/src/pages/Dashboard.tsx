import { useNavigate } from 'react-router-dom'
import { Plus, LogOut } from 'lucide-react'
import { useAuth } from '../components/AuthProvider'
import { motion } from 'framer-motion'

// ============================================================================
// Dashboard Component
// ============================================================================

export function Dashboard() {
  const navigate = useNavigate()
  const { signOut } = useAuth()

  return (
    <div className="min-h-screen bg-[#0F1419] p-4 sm:p-6 lg:p-8">
      {/* Header with Logout */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8 flex items-start justify-between"
      >
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white">Dashboard</h1>
          <p className="mt-2 text-[#9CA3AF]">Track your progress and stay consistent</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={signOut}
          className="h-11 px-4 flex items-center gap-2 bg-[#1A1F2E] border border-[#2A3142] text-[#9CA3AF] rounded-lg hover:border-red-500/50 hover:text-red-400 transition-all font-semibold"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </motion.button>
      </motion.div>

      {/* ====================================================================
          QUICK ACTIONS
          ==================================================================== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="max-w-md"
      >
        <div className="bg-[#1A1F2E] border border-[#2A3142] rounded-2xl p-6">
          <h2 className="text-2xl font-black tracking-tight text-white mb-6">Quick Actions</h2>
          <div className="flex flex-col gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-12 gap-2 bg-[#CCFF00] hover:bg-[#BBFF00] text-[#0F1419] font-bold rounded-lg transition-all shadow-md hover:shadow-lg hover:shadow-[#CCFF00]/20 flex items-center justify-center"
              onClick={() => navigate('/active-workout')}
            >
              <Plus className="h-5 w-5" />
              Start Workout
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-11 bg-transparent border-2 border-[#2A3142] text-[#9CA3AF] hover:border-[#CCFF00] hover:text-[#CCFF00] font-semibold rounded-lg transition-all"
              onClick={() => navigate('/history')}
            >
              📊 View History
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-11 bg-transparent border-2 border-[#2A3142] text-[#9CA3AF] hover:border-[#CCFF00] hover:text-[#CCFF00] font-semibold rounded-lg transition-all"
              onClick={() => navigate('/analytics')}
            >
              📈 Analytics
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
