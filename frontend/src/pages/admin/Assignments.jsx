
import { useEffect, useMemo, useState } from 'react'
import {
  ClipboardList,
  UserRound,
  Search,
  MapPin,
  CalendarDays,
  Plus,
  X,
  RefreshCw,
  AlertCircle,
  Ban,
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import api from '../../services/api'

const priorities = ['Low', 'Medium', 'High', 'Critical']

const assignmentStatuses = [
  'Assigned',
  'Accepted',
  'In Progress',
  'Completed',
  'Cancelled'
]

const emptyForm = {
  reportId: '',
  technicianId: '',
  priority: 'Medium',
  instructions: ''
}

function getErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.message ||
    'Something went wrong. Please try again.'
  )
}

function formatDate(date) {
  if (!date) return 'Not available'

  return new Date(date).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

function getReportLocation(report) {
  return report?.location?.address || 'Location not provided'
}

function getStatusStyle(status) {
  const styles = {
    Assigned: 'bg-blue-100 text-blue-700',
    Accepted: 'bg-purple-100 text-purple-700',
    'In Progress': 'bg-amber-100 text-amber-700',
    Completed: 'bg-green-100 text-green-700',
    Cancelled: 'bg-red-100 text-red-700'
  }

  return styles[status] || 'bg-gray-100 text-gray-600'
}

function getPriorityStyle(priority) {
  const styles = {
    Low: 'bg-green-100 text-green-700',
    Medium: 'bg-amber-100 text-amber-700',
    High: 'bg-red-100 text-red-700',
    Critical: 'bg-red-200 text-red-800'
  }

  return styles[priority] || 'bg-gray-100 text-gray-600'
}

export default function Assignments() {
  const [assignments, setAssignments] = useState([])
  const [reports, setReports] = useState([])
  const [technicians, setTechnicians] = useState([])

  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const [showCancelForm, setShowCancelForm] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [cancellationReason, setCancellationReason] = useState('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)

  // ========================================
  // FETCH ASSIGNMENTS, REPORTS AND TECHNICIANS
  // ========================================
  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')

      const [assignmentResponse, reportResponse, technicianResponse] =
        await Promise.all([
          api.get('/assignments', {
            params: { page, limit: 50 }
          }),

          api.get('/admin/reports', {
            params: {
              status: 'Verified',
              limit: 50
            }
          }),

          api.get('/technicians', {
            params: {
              availability: 'Available',
              employmentStatus: 'Active',
              limit: 50
            }
          })
        ])

      setAssignments(assignmentResponse.data.assignments || [])
      setTotal(assignmentResponse.data.total || 0)
      setPages(Math.max(1, assignmentResponse.data.pages || 1))

      setReports(reportResponse.data.reports || [])
      setTechnicians(technicianResponse.data.technicians || [])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [page])

  // ========================================
  // MAP TECHNICIAN IDs TO THEIR USER DETAILS
  // ========================================
  const technicianMap = useMemo(() => {
    const map = {}

    technicians.forEach((technician) => {
      map[technician._id] = technician
    })

    return map
  }, [technicians])

  const getTechnicianName = (assignment) => {
    const technicianId =
      assignment.technician?._id || assignment.technician

    const technician = technicianMap[technicianId]

    return (
      technician?.user?.name ||
      assignment.technician?.user?.name ||
      assignment.technician?.employeeId ||
      'Technician'
    )
  }

  // ========================================
  // SEARCH ASSIGNMENTS
  // ========================================
  const filteredAssignments = useMemo(() => {
    const term = search.trim().toLowerCase()

    if (!term) return assignments

    return assignments.filter((assignment) => {
      const values = [
        assignment._id,
        assignment.report?.title,
        assignment.report?.category,
        assignment.report?.location?.address,
        getTechnicianName(assignment),
        assignment.status,
        assignment.priority
      ]

      return values.some((value) =>
        String(value || '').toLowerCase().includes(term)
      )
    })
  }, [assignments, search, technicianMap])

  // ========================================
  // STATISTICS
  // ========================================
  const countStatus = (status) =>
    assignments.filter((item) => item.status === status).length

  // ========================================
  // FORM HANDLER
  // ========================================
  const handleFormChange = (e) => {
    const { name, value } = e.target

    setForm((current) => ({
      ...current,
      [name]: value
    }))
  }

  // ========================================
  // CREATE ASSIGNMENT
  // ========================================
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      if (!form.reportId || !form.technicianId) {
        setError('Please select a report and a technician.')
        return
      }

      const selectedReport = reports.find(
        (report) => report._id === form.reportId
      )

      if (!selectedReport) {
        setError('The selected report is no longer available.')
        return
      }

      const selectedTechnician = technicians.find(
        (technician) => technician._id === form.technicianId
      )

      if (!selectedTechnician) {
        setError('The selected technician is no longer available.')
        return
      }

      const payload = {
        reportId: form.reportId,
        technicianId: form.technicianId,
        priority: form.priority,
        instructions: form.instructions.trim()
      }

      await api.post('/assignments', payload)

      setForm(emptyForm)
      setShowForm(false)

      setSuccess('Technician assigned successfully.')

      await fetchData()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  // ========================================
  // OPEN CANCELLATION FORM
  // ========================================
  const openCancelForm = (assignment) => {
    setSelectedAssignment(assignment)
    setCancellationReason('')
    setError('')
    setShowCancelForm(true)
  }

  // ========================================
  // CANCEL ASSIGNMENT
  // ========================================
  const handleCancelAssignment = async (e) => {
    e.preventDefault()

    if (!selectedAssignment) return

    if (!cancellationReason.trim()) {
      setError('Please provide a cancellation reason.')
      return
    }

    try {
      setCancelling(true)
      setError('')
      setSuccess('')

      await api.patch(
        `/assignments/${selectedAssignment._id}/cancel`,
        {
          cancellationReason: cancellationReason.trim()
        }
      )

      setShowCancelForm(false)
      setSelectedAssignment(null)
      setCancellationReason('')

      setSuccess('Assignment cancelled successfully.')

      await fetchData()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#123B35]">
            Assignments Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Assign verified community reports to technicians and monitor progress.
          </p>
        </div>

        <button
          onClick={() => {
            setError('')
            setShowForm(true)
          }}
          disabled={reports.length === 0 || technicians.length === 0}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#123B35] px-5 py-3 text-sm font-semibold text-white hover:bg-[#19564D] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={18} />
          New Assignment
        </button>
      </div>

      {/* SUCCESS MESSAGE */}
      {success && (
        <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {success}

          <button onClick={() => setSuccess('')}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <span>{error}</span>

          <button onClick={() => setError('')}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* STATISTICS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Assignments"
          value={total}
          icon={ClipboardList}
        />

        <StatCard
          title="Assigned"
          value={countStatus('Assigned')}
          icon={UserRound}
        />

        <StatCard
          title="In Progress"
          value={countStatus('In Progress')}
          icon={CalendarDays}
        />
      </div>

      <p className="text-xs text-gray-400">
        Status counts show assignments on the current page. Total Assignments
        shows the total matching records.
      </p>

      {/* SEARCH */}
      <div className="relative rounded-xl border border-gray-100 bg-white p-4">
        <Search
          size={18}
          className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search assignments by report, technician, location or status..."
          className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-[#16A085]"
        />
      </div>

      {/* AVAILABILITY INFORMATION */}
      {!loading && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-gray-100 bg-white p-4">
            <p className="text-xs text-gray-500">Verified reports available</p>
            <p className="mt-1 text-xl font-bold text-[#123B35]">
              {reports.length}
            </p>
          </div>

          <div className="rounded-lg border border-gray-100 bg-white p-4">
            <p className="text-xs text-gray-500">Available active technicians</p>
            <p className="mt-1 text-xl font-bold text-[#123B35]">
              {technicians.length}
            </p>
          </div>
        </div>
      )}

      {/* ASSIGNMENT CARDS */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

        {loading ? (
          <div className="rounded-xl border border-gray-100 bg-white p-10 text-center text-gray-500 xl:col-span-2">
            <RefreshCw
              size={25}
              className="mx-auto mb-3 animate-spin text-[#16A085]"
            />
            Loading assignments from database...
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="rounded-xl border border-gray-100 bg-white p-10 text-center text-gray-500 xl:col-span-2">
            <ClipboardList
              size={32}
              className="mx-auto mb-3 text-gray-300"
            />

            No assignments found.
          </div>
        ) : (
          filteredAssignments.map((assignment) => (
            <div
              key={assignment._id}
              className="rounded-xl border border-gray-100 bg-white p-5"
            >

              {/* CARD HEADER */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-[#16A085]">
                    Assignment #{assignment._id.slice(-8).toUpperCase()}
                  </p>

                  <h2 className="mt-1 font-bold text-[#123B35]">
                    {assignment.report?.title || 'Community Report'}
                  </h2>

                  <p className="mt-1 text-xs text-gray-400">
                    {assignment.report?.category || 'Uncategorized'}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getPriorityStyle(assignment.priority)}`}
                >
                  {assignment.priority} Priority
                </span>
              </div>

              {/* DETAILS */}
              <div className="mt-5 space-y-3 text-sm text-gray-600">

                <p className="flex items-start gap-2">
                  <FileText size={16} className="mt-0.5 shrink-0" />
                  Report: {assignment.report?._id?.slice(-8).toUpperCase() || 'N/A'}
                </p>

                <p className="flex items-start gap-2">
                  <MapPin size={16} className="mt-0.5 shrink-0" />
                  {getReportLocation(assignment.report)}
                </p>

                <p className="flex items-center gap-2">
                  <UserRound size={16} />
                  {getTechnicianName(assignment)}
                </p>

                <p className="flex items-center gap-2">
                  <WrenchIcon />
                  {assignment.technician?.specialization || 'Specialization not available'}
                </p>

                <p className="flex items-center gap-2">
                  <CalendarDays size={16} />
                  Assigned: {formatDate(assignment.assignedAt)}
                </p>
              </div>

              {/* INSTRUCTIONS */}
              {assignment.instructions && (
                <div className="mt-4 rounded-lg bg-gray-50 p-3">
                  <p className="text-xs font-semibold text-gray-500">
                    Admin Instructions
                  </p>

                  <p className="mt-1 text-sm text-gray-700">
                    {assignment.instructions}
                  </p>
                </div>
              )}

              {/* STATUS */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                <div>
                  <p className="mb-2 text-xs font-semibold text-gray-500">
                    Assignment Status
                  </p>

                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(assignment.status)}`}
                  >
                    {assignment.status}
                  </span>
                </div>

                {!['Completed', 'Cancelled'].includes(assignment.status) && (
                  <button
                    onClick={() => openCancelForm(assignment)}
                    className="flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <Ban size={15} />
                    Cancel Assignment
                  </button>
                )}
              </div>

              {assignment.status === 'Completed' && (
                <p className="mt-3 text-xs text-green-700">
                  This assignment has been completed by the technician.
                </p>
              )}

              {assignment.status === 'Cancelled' && (
                <p className="mt-3 text-xs text-red-600">
                  Cancellation reason: {assignment.cancellationReason || 'Not provided'}
                </p>
              )}

            </div>
          ))
        )}

      </div>

      {/* PAGINATION */}
      {!loading && total > 0 && (
        <div className="flex flex-col justify-between gap-3 rounded-xl border border-gray-100 bg-white p-4 sm:flex-row sm:items-center">
          <p className="text-sm text-gray-500">
            Page {page} of {pages}
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <button
              onClick={() => setPage((current) => Math.min(pages, current + 1))}
              disabled={page >= pages}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 disabled:opacity-40"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* CREATE ASSIGNMENT MODAL */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !saving && setShowForm(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#123B35]">
                  Create New Assignment
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Select a verified report and an available technician.
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                disabled={saving}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* VERIFIED REPORT */}
              <FormField label="Select verified report">
                <select
                  required
                  name="reportId"
                  value={form.reportId}
                  onChange={handleFormChange}
                  className="form-input"
                >
                  <option value="">Choose a verified report</option>

                  {reports.map((report) => (
                    <option key={report._id} value={report._id}>
                      {report.title} — {report.category} — {getReportLocation(report)}
                    </option>
                  ))}
                </select>

                {reports.length === 0 && (
                  <p className="mt-2 text-xs text-amber-700">
                    No verified reports are currently available. Verify a report
                    first from All Reports.
                  </p>
                )}
              </FormField>

              {/* TECHNICIAN */}
              <FormField label="Assign technician">
                <select
                  required
                  name="technicianId"
                  value={form.technicianId}
                  onChange={handleFormChange}
                  className="form-input"
                >
                  <option value="">Choose an available technician</option>

                  {technicians.map((technician) => (
                    <option key={technician._id} value={technician._id}>
                      {technician.user?.name || technician.employeeId || 'Technician'}
                      {' — '}
                      {technician.specialization}
                    </option>
                  ))}
                </select>

                {technicians.length === 0 && (
                  <p className="mt-2 text-xs text-amber-700">
                    No active and available technicians found. Add or update a
                    technician first.
                  </p>
                )}
              </FormField>

              {/* PRIORITY */}
              <FormField label="Assignment priority">
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleFormChange}
                  className="form-input"
                >
                  {priorities.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </FormField>

              {/* INSTRUCTIONS */}
              <FormField label="Instructions for technician (optional)">
                <textarea
                  name="instructions"
                  value={form.instructions}
                  onChange={handleFormChange}
                  rows={4}
                  placeholder="Explain the work that needs to be done..."
                  className="form-input resize-y"
                />
              </FormField>

              <button
                type="submit"
                disabled={saving || reports.length === 0 || technicians.length === 0}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#123B35] py-3 font-semibold text-white hover:bg-[#19564D] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw size={17} className="animate-spin" />
                    Creating Assignment...
                  </>
                ) : (
                  'Create Assignment'
                )}
              </button>

            </form>
          </div>
        </div>
      )}

      {/* CANCEL ASSIGNMENT MODAL */}
      {showCancelForm && selectedAssignment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !cancelling && setShowCancelForm(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#123B35]">
                Cancel Assignment
              </h2>

              <button
                onClick={() => setShowCancelForm(false)}
                disabled={cancelling}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle size={18} className="mb-2" />

              You are about to cancel this assignment. Please provide a reason.
              The report may return to Verified status if it still belongs to
              this assignment.
            </div>

            <form onSubmit={handleCancelAssignment} className="space-y-4">
              <FormField label="Cancellation reason">
                <textarea
                  required
                  minLength={3}
                  rows={4}
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Explain why this assignment is being cancelled..."
                  className="form-input resize-y"
                />
              </FormField>

              <button
                type="submit"
                disabled={cancelling || !cancellationReason.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  )
}

// ========================================
// REUSABLE COMPONENTS
// ========================================

function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{title}</p>

        <div className="rounded-lg bg-[#E8F5F1] p-2 text-[#16A085]">
          <Icon size={20} />
        </div>
      </div>

      <p className="mt-3 text-2xl font-bold text-[#123B35]">
        {value}
      </p>
    </div>
  )
}

function FormField({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </label>

      {children}
    </div>
  )
}

function WrenchIcon() {
  return <ClipboardList size={16} />
}
