
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Search,
  ClipboardList,
  MapPin,
  CalendarDays,
  Clock,
  CheckCircle2,
  PlayCircle,
  AlertTriangle,
  RefreshCw,
  Loader2,
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

const priorityStyles = {
  Low: 'bg-gray-100 text-gray-700',
  Medium: 'bg-blue-100 text-blue-700',
  High: 'bg-orange-100 text-orange-700',
  Critical: 'bg-red-100 text-red-700',
}

export default function TechnicianAssignments() {
  const [assignments, setAssignments] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState({})
  const [completionNotes, setCompletionNotes] = useState({})
  const [successMessage, setSuccessMessage] = useState('')

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.get('/technician/jobs?limit=50')

      setAssignments(response.data?.assignments || [])
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to load your assignments. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAssignments()
  }, [fetchAssignments])

  // Run a backend action and refresh the assignment list.
  const performAction = async (id, action, successText, body = {}) => {
    try {
      setActionLoading((previous) => ({
        ...previous,
        [id]: true,
      }))

      setError('')
      setSuccessMessage('')

      await api.patch(`/technician/jobs/${id}/${action}`, body)

      setSuccessMessage(successText)

      if (action === 'complete') {
        setCompletionNotes((previous) => ({
          ...previous,
          [id]: '',
        }))
      }

      await fetchAssignments()
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'The requested job action failed. Please try again.'
      )
    } finally {
      setActionLoading((previous) => ({
        ...previous,
        [id]: false,
      }))
    }
  }

  // Search and status filtering.
  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      const report = assignment.report || {}

      const searchText = [
        report.title,
        report.description,
        report.location?.address,
        assignment._id,
        report._id,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const matchesSearch = searchText.includes(search.toLowerCase())

      const matchesFilter =
        filter === 'All' || assignment.status === filter

      return matchesSearch && matchesFilter
    })
  }, [assignments, search, filter])

  const counts = {
    total: assignments.length,
    assigned: assignments.filter((a) => a.status === 'Assigned').length,
    accepted: assignments.filter((a) => a.status === 'Accepted').length,
    progress: assignments.filter((a) => a.status === 'In Progress').length,
    completed: assignments.filter((a) => a.status === 'Completed').length,
  }

  const formatDate = (date) => {
    if (!date) return 'Date not provided'

    const parsedDate = new Date(date)

    if (Number.isNaN(parsedDate.getTime())) return 'Date not provided'

    return parsedDate.toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#123B35]">
            My Assignments
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View and manage the community repair jobs assigned to you.
          </p>
        </div>

        <button
          onClick={fetchAssignments}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} />
            {error}
          </div>
        </div>
      )}

      {successMessage && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} />
            {successMessage}
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total Jobs', value: counts.total, icon: ClipboardList },
          { label: 'Assigned', value: counts.assigned, icon: Clock },
          { label: 'In Progress', value: counts.progress, icon: PlayCircle },
          { label: 'Completed', value: counts.completed, icon: CheckCircle2 },
        ].map((item) => {
          const Icon = item.icon

          return (
            <div
              key={item.label}
              className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{item.label}</p>
                <Icon size={19} className="text-[#16A085]" />
              </div>

              <p className="mt-3 text-2xl font-bold text-[#123B35]">
                {loading ? '—' : item.value}
              </p>
            </div>
          )
        })}
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
            placeholder="Search by job, location or report ID..."
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

      {/* Assignment Cards */}
      <div className="space-y-4">

        {loading && (
          <div className="rounded-xl border border-gray-100 bg-white p-10 text-center">
            <Loader2 className="mx-auto animate-spin text-[#16A085]" size={30} />
            <p className="mt-3 text-sm text-gray-500">
              Loading your assignments...
            </p>
          </div>
        )}

        {!loading && filteredAssignments.length > 0 && (
          filteredAssignments.map((assignment) => {
            const report = assignment.report || {}
            const id = assignment._id
            const isBusy = Boolean(actionLoading[id])
            const notes = completionNotes[id] || ''

            return (
              <div
                key={id}
                className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row">

                  {/* Job Information */}
                  <div className="min-w-0 flex-1">

                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[assignment.status] || 'bg-gray-100 text-gray-700'}`}>
                        {assignment.status}
                      </span>

                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityStyles[assignment.priority] || 'bg-gray-100 text-gray-700'}`}>
                        {assignment.priority || 'Medium'} Priority
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-[#123B35]">
                      {report.title || 'Community repair job'}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Report ID: {report._id || 'Not provided'}
                    </p>

                    {report.description && (
                      <p className="mt-3 max-w-2xl text-sm text-gray-600">
                        {report.description}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-2">
                        <MapPin size={16} />
                        {report.location?.address || 'Location not provided'}
                      </span>

                      <span className="flex items-center gap-2">
                        <CalendarDays size={16} />
                        {formatDate(assignment.assignedAt)}
                      </span>
                    </div>

                    {assignment.instructions && (
                      <div className="mt-4 rounded-lg bg-blue-50 p-3">
                        <p className="text-xs font-semibold text-blue-800">
                          ADMIN INSTRUCTIONS
                        </p>
                        <p className="mt-1 text-sm text-blue-700">
                          {assignment.instructions}
                        </p>
                      </div>
                    )}

                  </div>

                  {/* Job Actions */}
                  <div className="flex min-w-48 flex-col justify-center gap-2">

                    {assignment.status === 'Assigned' && (
                      <button
                        disabled={isBusy}
                        onClick={() =>
                          performAction(
                            id,
                            'accept',
                            'Assignment accepted successfully.'
                          )
                        }
                        className="flex items-center justify-center gap-2 rounded-lg bg-[#123B35] px-4 py-3 text-sm font-semibold text-white hover:bg-[#16A085] disabled:opacity-50"
                      >
                        {isBusy ? (
                          <Loader2 size={17} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={17} />
                        )}
                        Accept Job
                      </button>
                    )}

                    {assignment.status === 'Accepted' && (
                      <button
                        disabled={isBusy}
                        onClick={() =>
                          performAction(
                            id,
                            'start',
                            'Job started successfully.'
                          )
                        }
                        className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isBusy ? (
                          <Loader2 size={17} className="animate-spin" />
                        ) : (
                          <PlayCircle size={17} />
                        )}
                        Start Job
                      </button>
                    )}

                    {assignment.status === 'Completed' && (
                      <div className="flex items-center justify-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                        <CheckCircle2 size={17} />
                        Job Completed
                      </div>
                    )}

                    {assignment.status === 'Cancelled' && (
                      <div className="rounded-lg bg-gray-100 px-4 py-3 text-center text-sm font-semibold text-gray-600">
                        Assignment Cancelled
                      </div>
                    )}

                    {assignment.status === 'In Progress' && (
                      <div className="rounded-lg bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-700">
                        <PlayCircle size={17} className="mr-1 inline" />
                        Work in Progress
                      </div>
                    )}

                  </div>
                </div>

                {/* Completion Form */}
                {assignment.status === 'In Progress' && (
                  <div className="mt-5 border-t border-gray-100 pt-5">
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#123B35]">
                      <FileText size={17} />
                      Job Completion Notes
                    </label>

                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) =>
                        setCompletionNotes((previous) => ({
                          ...previous,
                          [id]: e.target.value,
                        }))
                      }
                      placeholder="Describe the repair completed, materials used and any important details..."
                      className="form-input resize-y"
                    />

                    <button
                      disabled={isBusy || !notes.trim()}
                      onClick={() =>
                        performAction(
                          id,
                          'complete',
                          'Job completed. The report is now awaiting citizen confirmation.',
                          { completionNotes: notes.trim() }
                        )
                      }
                      className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isBusy ? (
                        <Loader2 size={17} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={17} />
                      )}
                      Complete Job
                    </button>
                  </div>
                )}

                {/* Priority Warning */}
                {['High', 'Critical'].includes(assignment.priority) && (
                  <div className="mt-4 flex items-center gap-2 rounded-lg bg-orange-50 p-3 text-sm text-orange-700">
                    <AlertTriangle size={17} />
                    Give this job priority and attend to it promptly.
                  </div>
                )}
              </div>
            )
          })
        )}

        {/* Empty State */}
        {!loading && filteredAssignments.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-5 py-12 text-center">
            <ClipboardList size={42} className="mx-auto text-gray-300" />

            <h3 className="mt-3 font-semibold text-[#123B35]">
              No assignments found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {assignments.length === 0
                ? 'The administrator has not assigned any jobs to you yet.'
                : 'No jobs match your current search or status filter.'}
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
