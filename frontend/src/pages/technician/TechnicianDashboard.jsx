
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  ArrowRight,
  CalendarDays,
  Wrench,
  UserRound,
  RefreshCw,
} from 'lucide-react'
import api from '../../services/api'

export default function TechnicianDashboard() {
  const navigate = useNavigate()

  const [assignments, setAssignments] = useState([])
  const [technicianName, setTechnicianName] = useState('Technician')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [totalAssignments, setTotalAssignments] = useState(0)

  // Get the logged-in technician's name.
  useEffect(() => {
    try {
      const savedUser = JSON.parse(
        localStorage.getItem('mtaafix_user') || 'null'
      )

      setTechnicianName(
        savedUser?.name || savedUser?.user?.name || 'Technician'
      )
    } catch {
      setTechnicianName('Technician')
    }
  }, [])

  // Fetch assignments belonging to the logged-in technician.
  const fetchAssignments = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.get('/technician/jobs?limit=50')

      const jobs = response.data?.assignments || []

      setAssignments(jobs)
      setTotalAssignments(response.data?.total ?? jobs.length)
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to load your assignments. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAssignments()
  }, [])

  // Calculate dashboard statistics from backend assignments.
  const pending = useMemo(
    () => assignments.filter(
      (item) => ['Assigned', 'Accepted'].includes(item.status)
    ),
    [assignments]
  )

  const inProgress = useMemo(
    () => assignments.filter(
      (item) => item.status === 'In Progress'
    ),
    [assignments]
  )

  const completed = useMemo(
    () => assignments.filter(
      (item) => item.status === 'Completed'
    ),
    [assignments]
  )

  const urgent = useMemo(
    () => assignments.filter(
      (item) => ['High', 'Critical'].includes(item.priority)
    ),
    [assignments]
  )

  const completionRate = totalAssignments
    ? Math.round((completed.length / totalAssignments) * 100)
    : 0

  const stats = [
    {
      title: 'Total Assignments',
      value: totalAssignments,
      icon: ClipboardList,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Pending Jobs',
      value: pending.length,
      icon: Clock,
      color: 'bg-orange-50 text-orange-600',
    },
    {
      title: 'In Progress',
      value: inProgress.length,
      icon: Wrench,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      title: 'Completed Jobs',
      value: completed.length,
      icon: CheckCircle2,
      color: 'bg-green-50 text-green-600',
    },
  ]

  const getStatusStyle = (status) => {
    if (status === 'Completed') {
      return 'bg-green-100 text-green-700'
    }

    if (status === 'In Progress') {
      return 'bg-blue-100 text-blue-700'
    }

    if (status === 'Cancelled') {
      return 'bg-gray-100 text-gray-600'
    }

    if (status === 'Accepted') {
      return 'bg-purple-100 text-purple-700'
    }

    return 'bg-orange-100 text-orange-700'
  }

  const getPriorityStyle = (priority) => {
    if (priority === 'Critical' || priority === 'High') {
      return 'bg-red-100 text-red-700'
    }

    if (priority === 'Medium') {
      return 'bg-amber-100 text-amber-700'
    }

    return 'bg-green-100 text-green-700'
  }

  return (
    <div className="space-y-7">

      {/* Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-500">
            Technician workspace
          </p>

          <h1 className="mt-1 text-2xl font-bold text-[#123B35] sm:text-3xl">
            Welcome back, {technicianName}!
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage your assigned community repair jobs.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={fetchAssignments}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>

          <button
            onClick={() => navigate('/technician/assignments')}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#123B35] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#16A085]"
          >
            View My Assignments
            <ArrowRight size={17} />
          </button>
        </div>
      </div>

      {/* Technician Profile */}
      <div className="rounded-xl border border-gray-100 bg-white p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F5F1] text-[#16A085]">
            <UserRound size={22} />
          </div>

          <div>
            <h2 className="font-semibold text-[#123B35]">
              Technician Profile
            </h2>
            <p className="text-xs text-gray-500">
              Logged in as {technicianName}
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="shrink-0 text-red-600" size={21} />
            <div>
              <p className="text-sm font-semibold text-red-800">
                Could not load assignments
              </p>
              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>
              <button
                onClick={fetchAssignments}
                className="mt-2 text-sm font-semibold text-red-800 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Urgent Jobs Alert */}
      {!loading && !error && urgent.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
          <AlertTriangle
            className="shrink-0 text-red-600"
            size={22}
          />

          <div>
            <h3 className="text-sm font-semibold text-red-800">
              Priority Attention Required
            </h3>

            <p className="mt-1 text-xs text-red-700">
              You have {urgent.length} high or critical priority assignment(s).
              Please review them.
            </p>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon

          return (
            <div
              key={stat.title}
              className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    {stat.title}
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-[#123B35]">
                    {loading ? '—' : stat.value}
                  </h2>
                </div>

                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                  <Icon size={23} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Assignments and Progress */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* Recent Assignments */}
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-100 p-5">
            <div>
              <h2 className="font-bold text-[#123B35]">
                My Assignments
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Jobs assigned to your technician account
              </p>
            </div>

            <button
              onClick={() => navigate('/technician/assignments')}
              className="text-sm font-medium text-[#16A085] hover:underline"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs text-gray-500">
                <tr>
                  <th className="px-5 py-4">Job Details</th>
                  <th className="px-5 py-4">Priority</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="3" className="px-5 py-10 text-center text-sm text-gray-500">
                      Loading your assignments...
                    </td>
                  </tr>
                )}

                {!loading && !error && assignments.slice(0, 5).map((item) => {
                  const report = item.report || {}

                  return (
                    <tr
                      key={item._id}
                      className="border-t border-gray-100"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-gray-800">
                          {report.title || 'Community repair job'}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Job #{item._id?.slice(-7)}
                        </p>

                        <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                          <MapPin size={12} />
                          {report.location?.address || 'Location not provided'}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${getPriorityStyle(item.priority)}`}>
                          {item.priority || 'Medium'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyle(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}

                {!loading && !error && assignments.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-5 py-10 text-center">
                      <ClipboardList
                        size={32}
                        className="mx-auto mb-3 text-gray-300"
                      />

                      <p className="text-sm font-medium text-gray-600">
                        No assignments yet
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        The administrator has not assigned any jobs to you.
                      </p>
                    </td>
                  </tr>
                )}

                {!loading && error && (
                  <tr>
                    <td colSpan="3" className="px-5 py-10 text-center text-sm text-gray-500">
                      Assignments could not be displayed.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Work Summary */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-[#123B35]">
            Work Summary
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Your assignment progress
          </p>

          <div className="mt-7">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Completion Rate
              </p>

              <p className="text-lg font-bold text-[#16A085]">
                {loading ? '—' : `${completionRate}%`}
              </p>
            </div>

            <div className="mt-3 h-3 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-[#16A085] transition-all"
                style={{ width: `${loading ? 0 : completionRate}%` }}
              />
            </div>
          </div>

          <div className="mt-7 space-y-5">
            {[
              {
                label: 'Completed',
                count: completed.length,
                color: 'bg-green-500',
              },
              {
                label: 'In Progress',
                count: inProgress.length,
                color: 'bg-blue-500',
              },
              {
                label: 'Pending',
                count: pending.length,
                color: 'bg-orange-500',
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                  <span className="text-sm text-gray-600">
                    {item.label}
                  </span>
                </div>

                <span className="text-sm font-semibold text-[#123B35]">
                  {loading ? '—' : item.count}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-7 border-t border-gray-100 pt-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8F5F1] text-[#16A085]">
                <CalendarDays size={20} />
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Total assignments
                </p>

                <p className="font-bold text-[#123B35]">
                  {loading ? '—' : `${totalAssignments} jobs`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Banner */}
      <div className="rounded-xl bg-[#123B35] p-6 text-white">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold">
              Make Every Repair Count
            </h2>

            <p className="mt-2 max-w-xl text-sm text-gray-300">
              Complete your assignments, update job progress and
              help make your community safer and cleaner.
            </p>
          </div>

          <button
            onClick={() => navigate('/technician/assignments')}
            className="whitespace-nowrap rounded-lg bg-[#16A085] px-5 py-3 text-sm font-semibold transition hover:bg-[#138D75]"
          >
            Manage Jobs
          </button>
        </div>
      </div>

    </div>
  )
}
