import { useNavigate } from 'react-router-dom'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Dumbbell, Activity, Flame, Plus, LogOut } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@repo/ui/Card'
import { Button } from '@repo/ui/Button'
import { useAuth } from '../components/AuthProvider'

// ============================================================================
// Mock Data
// ============================================================================

const mockStats = {
  totalWorkouts: 42,
  totalVolume: 8750, // kg
  currentStreak: 7, // days
}

const mockVolumeData = [
  { date: 'Oct 18', volume: 1200 },
  { date: 'Oct 19', volume: 1450 },
  { date: 'Oct 20', volume: 980 },
  { date: 'Oct 21', volume: 1650 },
  { date: 'Oct 22', volume: 1320 },
  { date: 'Oct 23', volume: 1580 },
  { date: 'Oct 24', volume: 1490 },
]

const mockRecentWorkouts = [
  { id: 1, name: 'Chest Day', date: 'Oct 24', volume: 1490 },
  { id: 2, name: 'Back & Biceps', date: 'Oct 23', volume: 1580 },
  { id: 3, name: 'Leg Day', date: 'Oct 22', volume: 1320 },
]

const workoutTemplates = [
  {
    id: 'chest-day',
    name: 'Chest Day',
    description: 'Chest, shoulders, and triceps',
    exercises: ['Bench Press', 'Incline Dumbbell Press', 'Cable Fly', 'Tricep Dips'],
  },
  {
    id: 'back-bis',
    name: 'Back & Biceps',
    description: 'Back and biceps focus',
    exercises: ['Barbell Row', 'Lat Pulldown', 'Dumbbell Curl', 'Barbell Curl'],
  },
  {
    id: 'leg-day',
    name: 'Leg Day',
    description: 'Lower body strength',
    exercises: ['Squat', 'Leg Press', 'Leg Curl', 'Romanian Deadlift'],
  },
  {
    id: 'full-body',
    name: 'Full Body',
    description: 'Complete full body workout',
    exercises: ['Deadlift', 'Bench Press', 'Squat', 'Barbell Row'],
  },
]

// ============================================================================
// Stat Card Component
// ============================================================================

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  unit?: string
}

function StatCard({ icon, label, value, unit }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className="mt-2 flex items-baseline gap-1">
              <p className="text-3xl font-bold text-foreground">{value}</p>
              {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
            </div>
          </div>
          <div className="rounded-lg bg-primary/10 p-3 text-primary">{icon}</div>
        </div>
        {/* Subtle accent bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 to-transparent" />
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Dashboard Component
// ============================================================================

export function Dashboard() {
  const navigate = useNavigate()
  const { signOut } = useAuth()

  const handleStartWorkout = (templateId: string) => {
    // You can pass template data through context or store if needed
    navigate('/active-workout', { state: { templateId } })
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      {/* Header with Logout */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Track your progress and stay consistent</p>
        </div>
        <Button variant="outline" size="sm" onClick={signOut} className="gap-2">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      {/* ====================================================================
          TOP ROW: Stats Cards
          ==================================================================== */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Dumbbell className="h-6 w-6" />}
          label="Total Workouts"
          value={mockStats.totalWorkouts}
        />
        <StatCard
          icon={<Activity className="h-6 w-6" />}
          label="Total Volume"
          value={mockStats.totalVolume.toLocaleString()}
          unit="kg"
        />
        <StatCard
          icon={<Flame className="h-6 w-6" />}
          label="Active Streak"
          value={mockStats.currentStreak}
          unit="days"
        />
      </div>

      {/* ====================================================================
          WORKOUT TEMPLATES: Choose & Start
          ==================================================================== */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-bold tracking-tight text-foreground">Start a Workout</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {workoutTemplates.map(template => (
            <Card
              key={template.id}
              className="flex flex-col justify-between transition-all hover:shadow-md hover:border-primary/50 cursor-pointer"
              onClick={() => handleStartWorkout(template.id)}
            >
              <CardContent className="pt-6">
                <h3 className="mb-2 font-semibold text-foreground">{template.name}</h3>
                <p className="mb-4 text-sm text-muted-foreground">{template.description}</p>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Exercises:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {template.exercises.map((exercise, i) => (
                      <li key={i}>• {exercise}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardContent className="pt-4">
                <Button
                  size="sm"
                  className="w-full gap-2"
                  onClick={e => {
                    e.stopPropagation()
                    handleStartWorkout(template.id)
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Start
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ====================================================================
          MIDDLE ROW: Chart + Quick Actions
          ==================================================================== */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Volume Chart (2/3 width on desktop) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockVolumeData}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: '0.875rem' }}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '0.875rem' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    formatter={value => `${value} kg`}
                  />
                  <Area
                    type="monotone"
                    dataKey="volume"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorVolume)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions (1/3 width on desktop) */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button size="lg" className="w-full gap-2" onClick={() => navigate('/active-workout')}>
              <Plus className="h-5 w-5" />
              Quick Start
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => alert('History view coming soon')}
            >
              View History
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => alert('Analytics coming soon')}
            >
              Analytics
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ====================================================================
          BOTTOM ROW: Recent Workouts
          ==================================================================== */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Workouts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockRecentWorkouts.map((workout, index) => (
              <div
                key={workout.id}
                className={`flex items-center justify-between rounded-lg border border-transparent bg-muted/50 p-4 transition-colors hover:border-border hover:bg-muted ${
                  index !== mockRecentWorkouts.length - 1
                    ? 'border-b border-border bg-transparent'
                    : ''
                }`}
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground">{workout.name}</p>
                  <p className="text-sm text-muted-foreground">{workout.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    {workout.volume.toLocaleString()} kg
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
