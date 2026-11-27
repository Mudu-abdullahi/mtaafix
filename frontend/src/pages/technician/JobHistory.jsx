
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Search,
  History,
  CheckCircle2,
  Clock,
  ClipboardList,
  MapPin,
  CalendarDays,
  RefreshCw,
  Loader2,
  AlertTriangle,
  FileText,
} from 'lucide-react'
import api from '../../services/api'

const statusStyles = {
  Assigned: 'bg-blue-100 text-blue-700',
  Accepted: 'bg-purple-100 text-purple-700',
  'In Progress': 'bg-amber-100 text-amber-700',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-gray-100 text-gray-600',
}

export default function JobHistory() {
  const [assignments, setAssignments] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.get('/technician/jobs?limit=50')

      setAssignments(response.data?.assignments || [])
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to load your job history. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const counts = useMemo(() => ({
    total: assignments.length,
    completed: assignments.filter(
      (job) => job.status === 'Completed'
    ).length,
    inProgress: assignments.filter(
      (job) => job.status === 'In Progress'
    ).length,
    assigned: assignments.filter(
      (job) => ['Assigned', 'Accepted'].includes(job.status)
    ).length,
  }), [assignments])

  const completionRate = counts.total
    ? Math.round((counts.completed / counts.total) * 100)
    : 0

  const filteredJobs = useMemo(() => {
    return assignments.filter((job) => {
      const report = job.report || {}

      const searchText = [
        report.title,
        report.description,
        report._id,
        report.location?.address,
        job._id,
        job.priority,
        job.completionNotes,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const matchesSearch = searchText.includes(search.toLowerCase())

      const matchesStatus =
        filter === 'All' || job.status === filter

      return matchesSearch && matchesStatus
    })
  }, [assignments, search, filter])

  const formatDate = (date) => {
    if (!date) return 'Not provided'

    const parsedDate = new Date(date)

    if (Number.isNaN(parsedDate.getTime())) return 'Not provided'

    return parsedDate.toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#123B35]">
            Job History
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Review your assigned repair jobs and track your work progress.
          </p>
        </div>

        <button
          onClick={fetchJobs}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? 'animate-spin' : ''}
          />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2 text-sm text-red-700">
            <AlertTriangle size={18} />
            {error}
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'Total Jobs',
            value: counts.total,
            icon: ClipboardList,
            color: 'text-[#16A085]',
          },
          {
            label: 'Completed',
            value: counts.completed,
            icon: CheckCircle2,
            color: 'text-green-600',
          },
          {
            label: 'In Progress',
            value: counts.inProgress,
            icon: Clock,
            color: 'text-amber-600',
          },
          {
            label: 'Pending',
            value: counts.assigned,
            icon: History,
            color: 'text-blue-600',
          },
        ].map((item) => {
          const Icon = item.icon

          return (
            <div
              key={item.label}
              className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{item.label}</p>
                <Icon size={20} className={item.color} />
              </div>

              <p className="mt-3 text-2xl font-bold text-[#123B35]">
                {loading ? '—' : item.value}
              </p>
            </div>
          )
        })}
      </div>

      {/* Completion Performance */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-[#123B35]">
              Completion Performance
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Percentage of your assigned jobs marked completed.
            </p>
          </div>

          <p className="text-2xl font-bold text-[#16A085]">
            {loading ? '—' : `${completionRate}%`}
          </p>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-[#16A085] transition-all"
            style={{ width: `${loading ? 0 : completionRate}%` }}
          />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search job title, report ID or location..."
            className="form-input pl-10"
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="form-input sm:w-52"
        >
          <option value="All">All Statuses</option>
          <option value="Assigned">Assigned</option>
          <option value="Accepted">Accepted</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Work Records */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5">
          <h2 className="font-semibold text-[#123B35]">
            Your Work Records
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {loading ? 'Loading records...' : `${filteredJobs.length} job(s) found`}
          </p>
        </div>

        {loading ? (
          <div className="px-5 py-12 text-center">
            <Loader2
              size={32}
              className="mx-auto animate-spin text-[#16A085]"
            />
            <p className="mt-3 text-sm text-gray-500">
              Loading your job history...
            </p>
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredJobs.map((job) => {
              const report = job.report || {}

              return (
                <div
                  key={job._id}
                  className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-start"
                >
                  <div className="min-w-0 flex-1">

                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          statusStyles[job.status] ||
                          'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {job.status}
                      </span>

                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                        {job.priority || 'Medium'} Priority
                      </span>
                    </div>

                    <h3 className="font-semibold text-[#123B35]">
                      {report.title || 'Community repair job'}
                    </h3>

                    <p className="mt-1 text-xs text-gray-400">
                      Report ID: {report._id || 'Not provided'}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin size={15} />
                        {report.location?.address || 'Location not provided'}
                      </span>

                      <span className="flex items-center gap-1">
                        <CalendarDays size={15} />
                        Assigned: {formatDate(job.assignedAt)}
                      </span>

                      {job.completedAt && (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 size={15} />
                          Completed: {formatDate(job.completedAt)}
                        </span>
                      )}
                    </div>

                    {job.completionNotes && (
                      <div className="mt-4 rounded-lg bg-green-50 p-3">
                        <p className="flex items-center gap-2 text-xs font-semibold text-green-800">
                          <FileText size={15} />
                          COMPLETION NOTES
                        </p>

                        <p className="mt-1 text-sm text-green-700">
                          {job.completionNotes}
                        </p>
                      </div>
                    )}

                    {job.evidence?.length > 0 && (
                      <div className="mt-3">
                        <p className="mb-2 text-xs font-semibold text-gray-600">
                          Repair Evidence
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {job.evidence.map((item, index) => (
                            <a
                              key={item._id || index}
                              href={item.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm font-medium text-[#16A085] underline"
                            >
                              View evidence {index + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 text-sm text-gray-500">
                    <p className="font-medium text-[#123B35]">
                      Assignment: {job._id?.slice(-8) || 'N/A'}
                    </p>

                    <p className="mt-1">
                      {job.assignedBy?.name
                        ? `Assigned by: ${job.assignedBy.name}`
                        : 'Administrator assignment'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="px-5 py-12 text-center">
            <History size={42} className="mx-auto text-gray-300" />

            <h3 className="mt-3 font-semibold text-[#123B35]">
              No job records found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {assignments.length === 0
                ? 'You do not have any assigned jobs yet.'
                : 'Try another search or status filter.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
