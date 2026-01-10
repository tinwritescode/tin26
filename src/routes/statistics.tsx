import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { useAuth } from '../common/hooks/useAuth'
import { trpc } from '../lib/trpc'
import { AppNav } from '../components/layout/AppNav'
import { Sidebar } from '../components/layout/Sidebar'
import { EmptyState } from '../components/habits/EmptyState'
import {
  TrendingUp,
  Calendar,
  Target,
  Award,
  Flame,
  Activity,
  Target as TargetIcon,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { getIcon } from '../utils/icons'

export const Route = createFileRoute('/statistics')({
  component: StatisticsPage,
})

type TimePeriod = '7d' | '30d' | '90d' | 'all'

function StatisticsPage() {
  const navigate = useNavigate()
  const { getToken } = useAuth()
  const hasToken = !!getToken()

  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d')

  const { data: userData, isLoading: userLoading } =
    trpc.auth.getCurrentUser.useQuery(undefined, {
      enabled: hasToken,
      retry: false,
    })

  const { data: activeTemplate, isLoading: templateLoading } =
    trpc.habits.getActiveTemplate.useQuery(undefined, {
      enabled: hasToken && !!userData,
      retry: false,
    })

  // Calculate date range based on time period
  const dateRange = useMemo(() => {
    const today = new Date()
    const endDate = today.toISOString().split('T')[0]

    let startDate: string | undefined
    if (timePeriod === '7d') {
      const date = new Date(today)
      date.setDate(date.getDate() - 7)
      startDate = date.toISOString().split('T')[0]
    } else if (timePeriod === '30d') {
      const date = new Date(today)
      date.setDate(date.getDate() - 30)
      startDate = date.toISOString().split('T')[0]
    } else if (timePeriod === '90d') {
      const date = new Date(today)
      date.setDate(date.getDate() - 90)
      startDate = date.toISOString().split('T')[0]
    }

    return { startDate, endDate }
  }, [timePeriod])

  const { data: statistics, isLoading: statsLoading } =
    trpc.habits.getHabitStatistics.useQuery(dateRange, {
      enabled: hasToken && !!userData && !!activeTemplate,
      retry: false,
    })

  const { data: weeklyStats, isLoading: weeklyLoading } =
    trpc.habits.getWeeklyStats.useQuery(
      { weeks: timePeriod === '7d' ? 4 : timePeriod === '30d' ? 8 : 12 },
      {
        enabled: hasToken && !!userData && !!activeTemplate,
        retry: false,
      },
    )

  const { data: monthlyStats, isLoading: monthlyLoading } =
    trpc.habits.getMonthlyStats.useQuery(
      { months: timePeriod === '7d' ? 1 : timePeriod === '30d' ? 3 : 6 },
      {
        enabled: hasToken && !!userData && !!activeTemplate,
        retry: false,
      },
    )

  trpc.habits.getHabitStreaks.useQuery(undefined, {
    enabled: hasToken && !!userData && !!activeTemplate,
    retry: false,
  })

  const currentYear = new Date().getFullYear()
  const { data: calendarData, isLoading: calendarLoading } =
    trpc.habits.getCompletionCalendar.useQuery(
      { year: currentYear },
      {
        enabled: hasToken && !!userData && !!activeTemplate,
        retry: false,
      },
    )

  // Prepare chart data - must be called before early returns
  const weeklyChartData = useMemo(() => {
    if (!weeklyStats) return []
    return weeklyStats.map((week) => ({
      week: new Date(week.weekStart).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      completions: week.totalCompletions,
      rate: Math.round(week.completionRate),
    }))
  }, [weeklyStats])

  const monthlyChartData = useMemo(() => {
    if (!monthlyStats) return []
    return monthlyStats.map((month) => ({
      month: new Date(month.month + '-01').toLocaleDateString('en-US', {
        month: 'short',
      }),
      completions: month.totalCompletions,
      rate: Math.round(month.completionRate),
    }))
  }, [monthlyStats])

  // Get top and bottom performers - must be called before early returns
  const topPerformers = useMemo(() => {
    if (!statistics?.habits) return []
    return [...statistics.habits]
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 3)
  }, [statistics])

  const needsAttention = useMemo(() => {
    if (!statistics?.habits) return []
    return [...statistics.habits]
      .sort((a, b) => a.completionRate - b.completionRate)
      .slice(0, 3)
      .filter((h) => h.completionRate < 50)
  }, [statistics])

  // Generate insights - must be called before early returns
  const insights = useMemo(() => {
    if (!statistics) return []
    const result: string[] = []

    if (statistics.currentStreak > 0) {
      result.push(
        `You've completed habits ${statistics.currentStreak} day${statistics.currentStreak === 1 ? '' : 's'} in a row! Keep it up!`,
      )
    }

    if (statistics.longestStreak > statistics.currentStreak) {
      result.push(
        `Your longest streak is ${statistics.longestStreak} days. You're ${statistics.longestStreak - statistics.currentStreak} days away from matching it!`,
      )
    }

    if (statistics.overallCompletionRate >= 80) {
      result.push("Excellent! You're maintaining an 80%+ completion rate.")
    } else if (statistics.overallCompletionRate >= 60) {
      result.push('Good progress! Try to aim for 80% completion rate.')
    } else if (statistics.overallCompletionRate > 0) {
      result.push(
        `You're at ${Math.round(statistics.overallCompletionRate)}% completion rate. Every day counts!`,
      )
    }

    if (topPerformers.length > 0) {
      result.push(
        `${topPerformers[0].habitName} is your best performing habit with ${Math.round(topPerformers[0].completionRate)}% completion rate.`,
      )
    }

    return result
  }, [statistics, topPerformers])

  // Loading state
  if (userLoading || templateLoading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5]">
        <AppNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 pt-4">
            <Sidebar activeItem="statistics" />
            <main className="flex-1 max-w-2xl">
              <div className="bg-white rounded-lg shadow-sm border border-[#CCD0D5] p-8">
                <div className="text-center text-[#65676B]">Loading...</div>
              </div>
            </main>
          </div>
        </div>
      </div>
    )
  }

  // Not logged in
  if (!userData) {
    return null
  }

  // No active template
  if (!activeTemplate) {
    return (
      <div className="min-h-screen bg-[#F0F2F5]">
        <AppNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 pt-4">
            <Sidebar activeItem="statistics" />
            <main className="flex-1 max-w-2xl">
              <div className="bg-white rounded-lg shadow-sm border border-[#CCD0D5] p-8">
                <EmptyState
                  icon={TargetIcon}
                  title="No Active Template"
                  description="You need an active template to view statistics. Go to Templates to create or activate one."
                  actionLabel="Go to Templates"
                  onAction={() => {
                    navigate({ to: '/templates' })
                  }}
                />
              </div>
            </main>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <AppNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-4 pt-4">
          <Sidebar activeItem="statistics" />
          <main className="flex-1 max-w-4xl">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-[#CCD0D5] p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-[#050505] mb-1">
                    Habit Statistics
                  </h1>
                  <p className="text-sm text-[#65676B]">
                    {activeTemplate.name}
                  </p>
                </div>
                <div className="flex gap-2">
                  {(['7d', '30d', '90d', 'all'] as TimePeriod[]).map(
                    (period) => (
                      <button
                        key={period}
                        onClick={() => setTimePeriod(period)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer ${
                          timePeriod === period
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {period === '7d'
                          ? '7 days'
                          : period === '30d'
                            ? '30 days'
                            : period === '90d'
                              ? '90 days'
                              : 'All time'}
                      </button>
                    ),
                  )}
                </div>
              </div>
            </div>

            {/* Overview Cards */}
            {statsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow-sm border border-[#CCD0D5] p-6 animate-pulse"
                  >
                    <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                    <div className="h-8 bg-slate-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : statistics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <StatCard
                  icon={Activity}
                  label="Total Completions"
                  value={statistics.totalCompletions.toLocaleString()}
                  color="blue"
                />
                <StatCard
                  icon={Target}
                  label="Completion Rate"
                  value={`${Math.round(statistics.overallCompletionRate)}%`}
                  color="green"
                />
                <StatCard
                  icon={Flame}
                  label="Current Streak"
                  value={`${statistics.currentStreak} days`}
                  color="orange"
                />
                <StatCard
                  icon={Award}
                  label="Longest Streak"
                  value={`${statistics.longestStreak} days`}
                  color="purple"
                />
                <StatCard
                  icon={TrendingUp}
                  label="Avg Per Day"
                  value={statistics.averageCompletionsPerDay.toFixed(1)}
                  color="indigo"
                />
                <StatCard
                  icon={Calendar}
                  label="Days Tracked"
                  value={statistics.totalDaysTracked.toString()}
                  color="slate"
                />
              </div>
            ) : null}

            {/* Insights */}
            {insights.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-[#CCD0D5] p-6 mb-4">
                <h2 className="text-lg font-semibold text-[#050505] mb-3">
                  Insights
                </h2>
                <div className="space-y-2">
                  {insights.map((insight, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-sm text-[#65676B]"
                    >
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              {/* Weekly Stats Chart */}
              {weeklyLoading ? (
                <div className="bg-white rounded-lg shadow-sm border border-[#CCD0D5] p-6 h-64 animate-pulse"></div>
              ) : weeklyChartData.length > 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-[#CCD0D5] p-6">
                  <h2 className="text-lg font-semibold text-[#050505] mb-4">
                    Weekly Completion Trend
                  </h2>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={weeklyChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E4E6EB" />
                      <XAxis
                        dataKey="week"
                        stroke="#65676B"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis stroke="#65676B" style={{ fontSize: '12px' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #CCD0D5',
                          borderRadius: '8px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="completions"
                        stroke="#1877F2"
                        fill="#1877F2"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : null}

              {/* Monthly Stats Chart */}
              {monthlyLoading ? (
                <div className="bg-white rounded-lg shadow-sm border border-[#CCD0D5] p-6 h-64 animate-pulse"></div>
              ) : monthlyChartData.length > 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-[#CCD0D5] p-6">
                  <h2 className="text-lg font-semibold text-[#050505] mb-4">
                    Monthly Overview
                  </h2>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={monthlyChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E4E6EB" />
                      <XAxis
                        dataKey="month"
                        stroke="#65676B"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis stroke="#65676B" style={{ fontSize: '12px' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #CCD0D5',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="completions" fill="#1877F2" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : null}
            </div>

            {/* Top Performers & Needs Attention */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              {/* Top Performers */}
              {topPerformers.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-[#CCD0D5] p-6">
                  <h2 className="text-lg font-semibold text-[#050505] mb-4">
                    Top Performers
                  </h2>
                  <div className="space-y-3">
                    {topPerformers.map((habit, idx) => {
                      const Icon = getIcon(habit.habitIcon)
                      return (
                        <div
                          key={habit.habitId}
                          className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100"
                        >
                          <div className="shrink-0 w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm">
                            {idx + 1}
                          </div>
                          <div className="shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-slate-800">
                              {habit.habitName}
                            </div>
                            <div className="text-sm text-slate-500">
                              {Math.round(habit.completionRate)}% completion
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-green-600">
                              {habit.totalCompletions}
                            </div>
                            <div className="text-xs text-slate-500">
                              completions
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Needs Attention */}
              {needsAttention.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-[#CCD0D5] p-6">
                  <h2 className="text-lg font-semibold text-[#050505] mb-4">
                    Needs Attention
                  </h2>
                  <div className="space-y-3">
                    {needsAttention.map((habit) => {
                      const Icon = getIcon(habit.habitIcon)
                      return (
                        <div
                          key={habit.habitId}
                          className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100"
                        >
                          <div className="shrink-0 w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-orange-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-slate-800">
                              {habit.habitName}
                            </div>
                            <div className="text-sm text-slate-500">
                              {Math.round(habit.completionRate)}% completion
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-orange-600">
                              {habit.totalCompletions}
                            </div>
                            <div className="text-xs text-slate-500">
                              completions
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Per-Habit Statistics Table */}
            {statsLoading ? (
              <div className="bg-white rounded-lg shadow-sm border border-[#CCD0D5] p-6 animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-slate-100 rounded"></div>
                  ))}
                </div>
              </div>
            ) : statistics?.habits && statistics.habits.length > 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-[#CCD0D5] p-6 mb-4">
                <h2 className="text-lg font-semibold text-[#050505] mb-4">
                  Per-Habit Statistics
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#CCD0D5]">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-[#050505]">
                          Habit
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-[#050505]">
                          Completions
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-[#050505]">
                          Rate
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-[#050505]">
                          Current Streak
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-[#050505]">
                          Longest Streak
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {statistics.habits.map((habit) => {
                        const Icon = getIcon(habit.habitIcon)
                        return (
                          <tr
                            key={habit.habitId}
                            className="border-b border-[#E4E6EB] hover:bg-slate-50 transition-colors duration-200"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                  <Icon className="w-4 h-4 text-slate-600" />
                                </div>
                                <span className="font-medium text-[#050505]">
                                  {habit.habitName}
                                </span>
                              </div>
                            </td>
                            <td className="text-right py-3 px-4 text-[#65676B]">
                              {habit.totalCompletions}
                            </td>
                            <td className="text-right py-3 px-4 text-[#65676B]">
                              {Math.round(habit.completionRate)}%
                            </td>
                            <td className="text-right py-3 px-4 text-[#65676B]">
                              {habit.currentStreak} days
                            </td>
                            <td className="text-right py-3 px-4 text-[#65676B]">
                              {habit.longestStreak} days
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {/* Calendar Heatmap */}
            {calendarLoading ? (
              <div className="bg-white rounded-lg shadow-sm border border-[#CCD0D5] p-6 animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
                <div className="h-32 bg-slate-100 rounded"></div>
              </div>
            ) : calendarData && calendarData.data.length > 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-[#CCD0D5] p-6">
                <h2 className="text-lg font-semibold text-[#050505] mb-4">
                  Completion Calendar {calendarData.year}
                </h2>
                <div className="grid grid-cols-7 gap-1">
                  {calendarData.data.map((day) => {
                    const intensity = Math.min(
                      day.completions / (statistics?.totalHabits || 1),
                      1,
                    )
                    const bgColor =
                      intensity === 0
                        ? 'bg-slate-100'
                        : intensity < 0.25
                          ? 'bg-blue-200'
                          : intensity < 0.5
                            ? 'bg-blue-400'
                            : intensity < 0.75
                              ? 'bg-blue-600'
                              : 'bg-blue-800'

                    return (
                      <div
                        key={day.date}
                        className={`aspect-square rounded ${bgColor} border border-white cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all duration-200`}
                        title={`${day.date}: ${day.completions} completion${day.completions === 1 ? '' : 's'}`}
                      />
                    )
                  })}
                </div>
                <div className="flex items-center justify-between mt-4 text-xs text-[#65676B]">
                  <span>Less</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded bg-slate-100"></div>
                    <div className="w-3 h-3 rounded bg-blue-200"></div>
                    <div className="w-3 h-3 rounded bg-blue-400"></div>
                    <div className="w-3 h-3 rounded bg-blue-600"></div>
                    <div className="w-3 h-3 rounded bg-blue-800"></div>
                  </div>
                  <span>More</span>
                </div>
              </div>
            ) : null}
          </main>
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  color: 'blue' | 'green' | 'orange' | 'purple' | 'indigo' | 'slate'
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    purple: 'bg-purple-100 text-purple-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    slate: 'bg-slate-100 text-slate-600',
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#CCD0D5] p-6 cursor-pointer hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-2">
        <div
          className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="text-2xl font-bold text-[#050505] mb-1">{value}</div>
      <div className="text-sm text-[#65676B]">{label}</div>
    </div>
  )
}
