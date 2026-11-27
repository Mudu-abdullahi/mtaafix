
import { useEffect, useState } from 'react'
import {
  Search,
  MapPin,
  CalendarDays,
  FileText,
  RefreshCw,
} from 'lucide-react'
import api from '../../services/api'

export default function MyReports() {
  const [reports, setReports] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchReports = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.get('/reports/mine')

      setReports(response.data.reports || [])
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to load your reports. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      (report.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (report.category || '').toLowerCase().includes(search.toLowerCase())

    const matchesFilter =
      filter === 'All' || report.status === filter

    return matchesSearch && matchesFilter
  })

  const statusColor = (status) => {
    switch (status) {
      case 'Resolved':
        return 'bg-green-100 text-green-700'
      case 'In Progress':
        return 'bg-blue-100 text-blue-700'
      case 'Assigned':
        return 'bg-purple-100 text-purple-700'
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

  const getLocation = (report) => {
    if (typeof report.location === 'string') {
      return report.location
    }

    return report.location?.address || 'Location not provided'
  }

  const getImage = (report) => {
    if (typeof report.image === 'string') {
      return report.image
    }

    return report.image?.url || null
  }

  const pendingCount = reports.filter(
    (report) => report.status === 'Pending'
  ).length

  const resolvedCount = reports.filter(
    (report) => report.status === 'Resolved'
  ).length

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-center">
          <RefreshCw
            size={30}
            className="mx-auto animate-spin text-[#16A085]"
          />
          <p className="mt-3 font-medium text-[#123B35]">
            Loading your reports...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#123B35]">
            My Reports
          </h1>
          <p className="mt-1 text-gray-500">
            View and track the community problems you have reported.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchReports}
          className="flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-[#123B35] hover:bg-gray-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p>
          <button
            type="button"
            onClick={fetchReports}
            className="mt-2 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      {!error && (
        <>
          {/* Report statistics */}
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Total Reports', value: reports.length },
              { label: 'Pending', value: pendingCount },
              { label: 'Resolved', value: resolvedCount },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl bg-white p-5 shadow-sm"
              >
                <p className="text-sm text-gray-500">
                  {item.label}
                </p>
                <h2 className="mt-2 text-3xl font-bold text-[#123B35]">
                  {item.value}
                </h2>
              </div>
            ))}
          </div>

          {/* Search and filter */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search your reports..."
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 outline-none focus:border-[#16A085]"
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#16A085]"
            >
              <option value="All">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="Verified">Verified</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Reports list */}
          {filteredReports.length === 0 ? (
            <div className="rounded-2xl bg-white px-6 py-14 text-center shadow-sm">
              <FileText
                size={42}
                className="mx-auto text-gray-300"
              />

              <h2 className="mt-4 text-lg font-bold text-[#123B35]">
                {reports.length === 0
                  ? 'No reports yet'
                  : 'No matching reports'}
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                {reports.length === 0
                  ? 'Your submitted community reports will appear here.'
                  : 'Try another search or status filter.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReports.map((report) => {
                const imageUrl = getImage(report)

                return (
                  <div
                    key={report._id}
                    className="rounded-2xl bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="font-bold text-[#123B35]">
                            {report.title}
                          </h2>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor(report.status)}`}
                          >
                            {report.status || 'Pending'}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-gray-500">
                          {report.category}
                        </p>

                        <p className="mt-3 text-sm leading-6 text-gray-600">
                          {report.description}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            {getLocation(report)}
                          </span>

                          <span className="flex items-center gap-1">
                            <CalendarDays size={14} />
                            {report.createdAt
                              ? new Date(report.createdAt).toLocaleDateString()
                              : 'Date unavailable'}
                          </span>
                        </div>
                      </div>

                      {imageUrl && (
                        <img
                          src={imageUrl}
                          alt="Reported problem"
                          className="h-28 w-full rounded-xl object-cover sm:w-36"
                        />
                      )}
                    </div>

                    <div className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-400">
                      Report ID: {report._id}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
