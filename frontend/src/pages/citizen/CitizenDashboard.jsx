
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  MapPin,
  RefreshCw,
} from 'lucide-react'
import api from '../../services/api'

export default function CitizenDashboard() {
  const [reports, setReports] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError('')

      const [reportsResponse, profileResponse] = await Promise.all([
        api.get('/reports/mine?limit=100'),
        api.get('/profile'),
      ])

      setReports(reportsResponse.data.reports || [])

      const profile =
        profileResponse.data.user ||
        profileResponse.data.profile ||
        profileResponse.data.data

      setUser(profile || null)
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to load your dashboard. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const totalReports = reports.length

  const pendingReports = reports.filter(
    (report) =>
      report.status === 'Pending' ||
      report.status === 'Under Review' ||
      report.status === 'Verified'
  ).length

  const inProgressReports = reports.filter(
    (report) =>
      report.status === 'Assigned' ||
      report.status === 'In Progress'
  ).length

  const resolvedReports = reports.filter(
    (report) => report.status === 'Resolved'
  ).length

  const stats = [
    {
      title: 'Total Reports',
      value: totalReports,
      icon: FileText,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      title: 'Pending Review',
      value: pendingReports,
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-700',
    },
    {
      title: 'In Progress',
      value: inProgressReports,
      icon: AlertTriangle,
      color: 'bg-purple-100 text-purple-700',
    },
    {
      title: 'Resolved',
      value: resolvedReports,
      icon: CheckCircle,
      color: 'bg-green-100 text-green-700',
    },
  ]

  const statusColor = (status) => {
    switch (status) {
      case 'Resolved':
        return 'bg-green-100 text-green-700'
      case 'In Progress':
        return 'bg-purple-100 text-purple-700'
      case 'Assigned':
        return 'bg-blue-100 text-blue-700'
      case 'Verified':
        return 'bg-teal-100 text-teal-700'
      case 'Under Review':
        return 'bg-indigo-100 text-indigo-700'
      case 'Rejected':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-yellow-100 text-yellow-700'
    }
  }

  const getLocation = (location) => {
    if (typeof location === 'string') return location
    return location?.address || 'Location unavailable'
  }

  const today = new Date().toLocaleDateString('en-KE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const recentReports = [...reports]
    .sort(
      (a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    )
    .slice(0, 5)

  if (loading) {
    return (
      <div className="flex min-h-[350px] items-center justify-center">
        <div className="text-center">
          <RefreshCw
            size={30}
            className="mx-auto animate-spin text-[#16A085]"
          />
          <p className="mt-3 font-medium text-[#123B35]">
            Loading your dashboard...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">

      {/* Welcome section */}
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-gray-500">{today}</p>

          <h1 className="mt-2 text-3xl font-bold text-[#123B35]">
            Welcome back, {user?.name || 'Citizen'}!
          </h1>

          <p className="mt-2 text-gray-500">
            Here's what's happening in your community.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchDashboardData}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 font-semibold text-[#123B35] hover:bg-gray-50"
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <Link
            to="/citizen/report"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#123B35] px-5 py-3 font-semibold text-white hover:bg-[#16A085]"
          >
            <Plus size={19} />
            Report a Problem
          </Link>
        </div>
      </section>

      {/* Error message */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
          <button
            onClick={fetchDashboardData}
            className="ml-3 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      {!error && (
        <>
          {/* Statistics */}
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon

              return (
                <div
                  key={stat.title}
                  className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
                >
                  <div className={`w-fit rounded-xl p-3 ${stat.color}`}>
                    <Icon size={23} />
                  </div>

                  <h2 className="mt-5 text-3xl font-bold text-[#123B35]">
                    {stat.value}
                  </h2>

                  <p className="mt-2 font-medium text-gray-700">
                    {stat.title}
                  </p>
                </div>
              )
            })}
          </section>

          {/* Report encouragement */}
          <section className="rounded-2xl bg-[#123B35] p-7 text-white">
            <p className="text-sm text-green-200">
              Make a difference today
            </p>

            <h2 className="mt-3 text-2xl font-bold">
              See a problem? Report it!
            </h2>

            <p className="mt-3 max-w-lg text-sm leading-6 text-green-100">
              Help improve your neighbourhood by reporting potholes,
              garbage, broken streetlights, drainage and other issues.
            </p>

            <Link
              to="/citizen/report"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#16A085] px-5 py-3 font-semibold text-white hover:bg-[#12866F]"
            >
              Submit a Report <Plus size={18} />
            </Link>
          </section>

          {/* Recent reports */}
          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b p-6">
              <div>
                <h2 className="text-xl font-bold text-[#123B35]">
                  Recent Reports
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Track your submitted reports.
                </p>
              </div>

              <Link
                to="/citizen/reports"
                className="text-sm font-semibold text-[#16A085]"
              >
                View All →
              </Link>
            </div>

            {recentReports.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <FileText
                  size={40}
                  className="mx-auto text-gray-300"
                />

                <h3 className="mt-4 font-bold text-[#123B35]">
                  No reports yet
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Your submitted community reports will appear here.
                </p>

                <Link
                  to="/citizen/report"
                  className="mt-4 inline-flex rounded-xl bg-[#16A085] px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Submit your first report
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-6 py-4">Report</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Location</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentReports.map((report) => (
                      <tr
                        key={report._id}
                        className="border-t border-gray-100"
                      >
                        <td className="px-6 py-5">
                          <p className="font-semibold text-[#123B35]">
                            {report.title}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            {report._id}
                          </p>
                        </td>

                        <td className="px-6 py-5 text-sm text-gray-600">
                          {report.category}
                        </td>

                        <td className="px-6 py-5 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            {getLocation(report.location)}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusColor(report.status)}`}
                          >
                            {report.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      <p className="text-center text-xs text-gray-400">
        MtaaFix — Together, We Fix Our Communities.
      </p>
    </div>
  )
}
