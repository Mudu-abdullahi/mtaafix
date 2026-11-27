
import { useEffect, useState } from 'react'
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  Wrench,
  ArrowUpRight,
  ArrowRight,
  MapPin,
  CalendarDays,
  RefreshCw,
} from 'lucide-react'

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

import { Link } from 'react-router-dom'
import api from '../../services/api'

const categoryColors = [
  '#16A085',
  '#3B82F6',
  '#F59E0B',
  '#8B5CF6',
  '#EF4444',
  '#06B6D4',
  '#64748B',
]

const formatNumber = (value) =>
  Number(value || 0).toLocaleString()

const formatDate = (date) => {
  if (!date) return '—'

  return new Date(date).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const statisticsConfig = [
  {
    title: 'Total Reports',
    key: 'total',
    icon: FileText,
    color: 'bg-blue-100 text-blue-700',
  },
  {
    title: 'Pending Reports',
    key: 'pending',
    icon: Clock,
    color: 'bg-orange-100 text-orange-700',
  },
  {
    title: 'Resolved Issues',
    key: 'resolved',
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-700',
  },
  {
    title: 'Urgent Reports',
    key: 'urgent',
    icon: AlertTriangle,
    color: 'bg-red-100 text-red-700',
  },
]

function StatusBadge({ status }) {
  const styles = {
    Pending: 'bg-orange-100 text-orange-700',
    'Under Review': 'bg-yellow-100 text-yellow-700',
    Verified: 'bg-purple-100 text-purple-700',
    Assigned: 'bg-indigo-100 text-indigo-700',
    'In Progress': 'bg-blue-100 text-blue-700',
    Resolved: 'bg-green-100 text-green-700',
    Rejected: 'bg-red-100 text-red-700',
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] || 'bg-gray-100 text-gray-700'
      }`}
    >
      {status || 'Unknown'}
    </span>
  )
}

function StatCard({ item, value }) {
  const Icon = item.icon

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.color}`}>
          <Icon size={23} />
        </div>

        <ArrowUpRight size={18} className="text-gray-400" />
      </div>

      <p className="mt-5 text-sm font-medium text-gray-500">
        {item.title}
      </p>

      <h3 className="mt-1 text-3xl font-bold text-[#123B35]">
        {formatNumber(value)}
      </h3>
    </div>
  )
}

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [urgentCount, setUrgentCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      setError('')

      const [dashboardResponse, highResponse, criticalResponse] =
        await Promise.all([
          api.get('/admin/dashboard'),
          api.get('/admin/reports?severity=High&limit=1'),
          api.get('/admin/reports?severity=Critical&limit=1'),
        ])

      const data = dashboardResponse.data

      if (!data.success) {
        throw new Error(data.message || 'Could not load dashboard.')
      }

      setDashboard(data)

      setUrgentCount(
        Number(highResponse.data.total || 0) +
        Number(criticalResponse.data.total || 0)
      )
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to load dashboard data.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  const stats = dashboard?.statistics
  const reports = stats?.reports || {}
  const users = stats?.users || {}

  const statistics = statisticsConfig.map((item) => {
    let value = 0

    if (item.key === 'pending') {
      value =
        Number(reports.pending || 0) +
        Number(reports.underReview || 0)
    } else if (item.key === 'urgent') {
      value = urgentCount
    } else {
      value = reports[item.key] || 0
    }

    return { ...item, value }
  })

  const categoryData = (stats?.categoryBreakdown || []).map(
    (item, index) => ({
      name: item._id || 'Other',
      value: item.total || 0,
      color: categoryColors[index % categoryColors.length],
    })
  )

  const statusData = (stats?.statusBreakdown || []).map((item) => ({
    status: item._id || 'Unknown',
    total: item.total || 0,
  }))

  const recentReports = dashboard?.recentReports || []

  const resolutionRate = Number(
    stats?.performance?.resolutionRate || 0
  )

  if (loading && !dashboard) {
    return (
      <div className="flex min-h-[350px] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto animate-spin text-[#16A085]" size={32} />
          <p className="mt-3 text-sm text-gray-500">
            Loading admin dashboard...
          </p>
        </div>
      </div>
    )
  }

  if (error && !dashboard) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-3 text-red-700">
          <AlertTriangle size={24} />
          <h2 className="font-bold">Dashboard could not load</h2>
        </div>

        <p className="mt-2 text-sm text-red-600">{error}</p>

        <button
          onClick={fetchDashboard}
          className="mt-4 rounded-lg bg-[#123B35] px-5 py-2 text-sm font-semibold text-white hover:bg-[#16A085]"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-7">
      {/* Page Heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#123B35]">
            Dashboard Overview
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Monitor community reports and platform performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
            <CalendarDays size={18} />
            {new Date().toLocaleDateString('en-KE', {
              month: 'long',
              year: 'numeric',
            })}
          </div>

          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-[#123B35] px-4 py-3 text-sm font-semibold text-white hover:bg-[#16A085] disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Main Statistics */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statistics.map((item) => (
          <StatCard key={item.title} item={item} value={item.value} />
        ))}
      </div>

      {/* Secondary Statistics */}
      <div className="grid gap-5 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
            <Users size={24} />
          </div>

          <div>
            <p className="text-sm text-gray-500">Registered Citizens</p>
            <h3 className="text-2xl font-bold text-[#123B35]">
              {formatNumber(users.totalCitizens)}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
            <Wrench size={24} />
          </div>

          <div>
            <p className="text-sm text-gray-500">Active Technicians</p>
            <h3 className="text-2xl font-bold text-[#123B35]">
              {formatNumber(users.activeTechnicians)}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <CheckCircle2 size={24} />
          </div>

          <div>
            <p className="text-sm text-gray-500">Resolution Rate</p>
            <h3 className="text-2xl font-bold text-[#123B35]">
              {resolutionRate}%
            </h3>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Report Status Chart */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[#123B35]">
              Reports by Status
            </h2>

            <p className="text-sm text-gray-500">
              Current distribution of community reports
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={statusData}>
                <defs>
                  <linearGradient id="reportGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A085" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#16A085" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} />

                <XAxis
                  dataKey="status"
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis tickLine={false} axisLine={false} />

                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="total"
                  name="Reports"
                  stroke="#16A085"
                  fill="url(#reportGradient)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-[#123B35]">
            Report Categories
          </h2>

          <p className="text-sm text-gray-500">
            Distribution of reported problems
          </p>

          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {categoryData.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {categoryData.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-sm"
              >
                <span className="flex items-center gap-2 text-gray-600">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.name}
                </span>

                <span className="font-semibold text-[#123B35]">
                  {formatNumber(item.value)}
                </span>
              </div>
            ))}

            {categoryData.length === 0 && (
              <p className="text-sm text-gray-400">
                No category data available yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-[#123B35]">
              Recent Community Reports
            </h2>

            <p className="text-sm text-gray-500">
              Latest problems submitted by citizens
            </p>
          </div>

          <Link
            to="/admin/reports"
            className="flex items-center gap-2 text-sm font-semibold text-[#16A085] hover:text-[#123B35]"
          >
            View all reports
            <ArrowRight size={17} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-4">Report</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Location</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {recentReports.map((report) => (
                <tr key={report._id} className="transition hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-[#123B35]">
                      {report.title}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {report._id?.slice(-8).toUpperCase()}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-600">
                    {report.category}
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {report.location?.address || 'Location not provided'}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-500">
                    {formatDate(report.createdAt)}
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge status={report.status} />
                  </td>
                </tr>
              ))}

              {recentReports.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-5 py-10 text-center text-sm text-gray-400">
                    No reports have been submitted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Urgent Reports */}
      <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-red-100 p-3 text-red-600">
            <AlertTriangle size={24} />
          </div>

          <div className="flex-1">
            <h2 className="font-bold text-red-800">
              Urgent Community Issues
            </h2>

            <p className="mt-1 text-sm text-red-700">
              There are {formatNumber(urgentCount)} reports marked High or
              Critical priority. These issues should be reviewed and prioritised.
            </p>

            <Link
              to="/admin/reports"
              className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-red-800 hover:underline"
            >
              Review reports
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
