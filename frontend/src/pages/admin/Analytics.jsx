
import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import {
  BarChart3,
  ClipboardList,
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import api from '../../services/api'

const COLORS = [
  '#16A085',
  '#2563EB',
  '#F59E0B',
  '#8B5CF6',
  '#EF4444',
  '#0EA5E9',
  '#64748B'
]

export default function Analytics() {
  const [statistics, setStatistics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.get('/admin/dashboard')

      setStatistics(response.data.statistics || null)
    } catch (err) {
      console.error('Analytics loading error:', err)

      setError(
        err.response?.data?.message ||
        'Unable to load analytics. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const reports = statistics?.reports || {}
  const performance = statistics?.performance || {}

  const totalReports = Object.values(reports).reduce(
    (total, value) => total + (Number(value) || 0),
    0
  )

  const resolvedReports = Number(reports.resolved || 0)
  const pendingReports = Number(reports.pending || 0)
  const inProgressReports = Number(reports.inProgress || 0)

  const resolutionRate = Number(performance.resolutionRate || 0)

  const categoryData = (statistics?.categoryBreakdown || []).map(
    (item) => ({
      name: item._id || item.category || 'Other',
      value: Number(item.count || 0)
    })
  )

  const statusData = (statistics?.statusBreakdown || []).map(
    (item) => ({
      name: item._id || item.status || 'Other',
      reports: Number(item.count || 0)
    })
  )

  const statusCount = (status) => {
    const match = statusData.find(
      (item) => item.name.toLowerCase() === status.toLowerCase()
    )

    return match?.reports || 0
  }

  const summaryCards = [
    {
      title: 'Total Reports',
      value: totalReports,
      icon: ClipboardList,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Resolved Reports',
      value: resolvedReports,
      icon: CheckCircle,
      color: 'bg-green-50 text-green-600'
    },
    {
      title: 'Pending Reports',
      value: pendingReports,
      icon: Clock,
      color: 'bg-amber-50 text-amber-600'
    },
    {
      title: 'In Progress',
      value: inProgressReports,
      icon: TrendingUp,
      color: 'bg-purple-50 text-purple-600'
    }
  ]

  if (loading) {
    return (
      <div className="flex min-h-[350px] items-center justify-center text-gray-500">
        <RefreshCw size={22} className="mr-3 animate-spin" />
        Loading analytics...
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#123B35]">
            Analytics & Reports
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Monitor community reports and MtaaFix performance.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#123B35] px-5 py-3 text-sm font-semibold text-white hover:bg-[#19564D]"
        >
          <RefreshCw size={17} />
          Refresh Analytics
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {!statistics ? (
        <div className="rounded-xl border border-gray-100 bg-white p-10 text-center text-gray-500">
          No analytics data is currently available.
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => {
              const Icon = card.icon

              return (
                <div
                  key={card.title}
                  className="rounded-xl border border-gray-100 bg-white p-5"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      {card.title}
                    </p>

                    <div className={`rounded-lg p-3 ${card.color}`}>
                      <Icon size={21} />
                    </div>
                  </div>

                  <p className="mt-4 text-3xl font-bold text-[#123B35]">
                    {card.value}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Performance */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

            <div className="rounded-xl border border-gray-100 bg-white p-6 lg:col-span-2">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-50 p-3 text-green-600">
                  <TrendingUp size={22} />
                </div>

                <div>
                  <h2 className="font-bold text-[#123B35]">
                    Resolution Performance
                  </h2>

                  <p className="text-sm text-gray-500">
                    Percentage of reports successfully resolved
                  </p>
                </div>
              </div>

              <div className="mt-7">
                <div className="flex items-end justify-between">
                  <p className="text-4xl font-bold text-[#123B35]">
                    {resolutionRate}%
                  </p>

                  <p className="text-sm text-gray-500">
                    {resolvedReports} resolved
                  </p>
                </div>

                <div className="mt-4 h-4 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-[#16A085] transition-all"
                    style={{
                      width: `${Math.min(Math.max(resolutionRate, 0), 100)}%`
                    }}
                  />
                </div>

                <p className="mt-3 text-xs text-gray-400">
                  Based on the resolution rate returned by the backend.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-6">
              <h2 className="font-bold text-[#123B35]">
                Report Overview
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Current report distribution
              </p>

              <div className="mt-5 space-y-5">
                <ProgressRow
                  label="Pending"
                  value={statusCount('Pending')}
                  total={totalReports}
                  color="bg-amber-500"
                />

                <ProgressRow
                  label="In Progress"
                  value={statusCount('In Progress')}
                  total={totalReports}
                  color="bg-blue-500"
                />

                <ProgressRow
                  label="Resolved"
                  value={statusCount('Resolved')}
                  total={totalReports}
                  color="bg-green-500"
                />

                <ProgressRow
                  label="Rejected"
                  value={statusCount('Rejected')}
                  total={totalReports}
                  color="bg-red-500"
                />
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

            {/* Category Chart */}
            <div className="rounded-xl border border-gray-100 bg-white p-5">
              <div className="mb-5">
                <h2 className="font-bold text-[#123B35]">
                  Reports by Category
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Types of problems reported by citizens
                </p>
              </div>

              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={categoryData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 55 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="name"
                      angle={-25}
                      textAnchor="end"
                      interval={0}
                      height={75}
                      tick={{ fontSize: 11 }}
                    />

                    <YAxis allowDecimals={false} />

                    <Tooltip />

                    <Bar
                      dataKey="value"
                      name="Reports"
                      fill="#16A085"
                      radius={[5, 5, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart />
              )}
            </div>

            {/* Status Chart */}
            <div className="rounded-xl border border-gray-100 bg-white p-5">
              <div className="mb-5">
                <h2 className="font-bold text-[#123B35]">
                  Reports by Status
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Distribution of report progress
                </p>
              </div>

              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="reports"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      outerRadius={105}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {statusData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>

                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart />
              )}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
            <div className="border-b border-gray-100 p-5">
              <h2 className="font-bold text-[#123B35]">
                Category Breakdown
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Total reports recorded for each problem category
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] text-left text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4">Number of Reports</th>
                    <th className="px-5 py-4">Share</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {categoryData.map((item) => {
                    const percentage = totalReports
                      ? (item.value / totalReports) * 100
                      : 0

                    return (
                      <tr key={item.name}>
                        <td className="px-5 py-4 font-medium text-[#123B35]">
                          {item.name}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {item.value}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {percentage.toFixed(1)}%
                        </td>
                      </tr>
                    )
                  })}

                  {categoryData.length === 0 && (
                    <tr>
                      <td
                        colSpan="3"
                        className="px-5 py-8 text-center text-gray-500"
                      >
                        No category data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* System Information */}
          <div className="rounded-xl border border-amber-100 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle
                size={22}
                className="shrink-0 text-amber-600"
              />

              <div>
                <h3 className="font-semibold text-amber-800">
                  Analytics information
                </h3>

                <p className="mt-1 text-sm leading-6 text-amber-700">
                  These figures are calculated from the reports currently
                  stored in the MtaaFix database. Charts display the
                  category and status breakdowns returned by the backend.
                  Historical trends are not shown because a time-series
                  analytics endpoint has not yet been implemented.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function ProgressRow({ label, value, total, color }) {
  const percentage = total ? (value / total) * 100 : 0

  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>

        <span className="font-semibold text-[#123B35]">
          {value}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full ${color}`}
          style={{
            width: `${Math.min(percentage, 100)}%`
          }}
        />
      </div>
    </div>
  )
}

function EmptyChart() {
  return (
    <div className="flex h-[320px] flex-col items-center justify-center text-gray-400">
      <BarChart3 size={35} />
      <p className="mt-3 text-sm">No chart data available yet.</p>
    </div>
  )
}
