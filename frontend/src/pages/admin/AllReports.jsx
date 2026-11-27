
import { useEffect, useMemo, useState } from 'react'
import {
  Search,
  Filter,
  Eye,
  MapPin,
  CalendarDays,
  ClipboardList,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  User,
  Image as ImageIcon
} from 'lucide-react'
import api from '../../services/api'

const statusStyles = {
  Pending: 'bg-amber-100 text-amber-700',
  'Under Review': 'bg-purple-100 text-purple-700',
  Verified: 'bg-cyan-100 text-cyan-700',
  Assigned: 'bg-indigo-100 text-indigo-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  Resolved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700'
}

const categories = [
  'Pothole',
  'Broken Streetlight',
  'Blocked Drainage',
  'Garbage',
  'Water Leakage',
  'Exposed Electrical Wires',
  'Other'
]

const statuses = [
  'Pending',
  'Under Review',
  'Verified',
  'Assigned',
  'In Progress',
  'Resolved',
  'Rejected'
]

const workflowManagedStatuses = [
  'Assigned',
  'In Progress',
  'Resolved'
]

const severities = ['Low', 'Medium', 'High', 'Critical']

function formatDate(date) {
  if (!date) return 'Not provided'

  return new Date(date).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

function getLocation(report) {
  if (typeof report?.location === 'string') {
    return report.location
  }

  return report?.location?.address || 'Location not provided'
}

function getReportCode(report) {
  return report?._id
    ? `MTF-${report._id.slice(-6).toUpperCase()}`
    : 'Unknown ID'
}

function getErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.message ||
    'Something went wrong. Please try again.'
  )
}

export default function AllReports() {
  const [reports, setReports] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [severityFilter, setSeverityFilter] = useState('All')

  const [selectedReport, setSelectedReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)

  // ========================================
  // FETCH REPORTS FROM MONGODB
  // ========================================
  const fetchReports = async () => {
    try {
      setLoading(true)
      setError('')

      const params = {
        page,
        limit: 10
      }

      if (statusFilter !== 'All') {
        params.status = statusFilter
      }

      if (categoryFilter !== 'All') {
        params.category = categoryFilter
      }

      if (severityFilter !== 'All') {
        params.severity = severityFilter
      }

      const response = await api.get('/admin/reports', { params })
      const data = response.data

      setReports(data.reports || [])
      setTotal(data.total || 0)
      setPages(Math.max(1, data.pages || 1))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [page, statusFilter, categoryFilter, severityFilter])

  // ========================================
  // SEARCH CURRENT PAGE
  // ========================================
  const filteredReports = useMemo(() => {
    const term = search.trim().toLowerCase()

    if (!term) return reports

    return reports.filter((report) => {
      const values = [
        report.title,
        report.description,
        report.category,
        getLocation(report),
        getReportCode(report),
        report.reportedBy?.name,
        report.reportedBy?.email
      ]

      return values.some((value) =>
        String(value || '').toLowerCase().includes(term)
      )
    })
  }, [reports, search])

  // ========================================
  // STATISTICS FOR CURRENT PAGE
  // ========================================
  const countStatus = (status) =>
    reports.filter((report) => report.status === status).length

  // ========================================
  // OPEN REPORT DETAILS
  // ========================================
  const openReport = async (report) => {
    setSelectedReport(report)
    setDetailsLoading(true)
    setError('')

    try {
      const response = await api.get(`/admin/reports/${report._id}`)

      setSelectedReport(response.data.report || report)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setDetailsLoading(false)
    }
  }

  // ========================================
  // UPDATE REPORT STATUS IN DATABASE
  // ========================================
  const updateStatus = async () => {
    if (!selectedReport?._id) return

    const originalReport = reports.find(
      (report) => report._id === selectedReport._id
    )

    const newStatus = selectedReport.status
    const currentStatus = originalReport?.status

    if (newStatus === currentStatus) {
      setSelectedReport(null)
      return
    }

    // These statuses must be managed through assignments
    // and the technician workflow.
    if (workflowManagedStatuses.includes(newStatus)) {
      setError(
        'This status is managed through the assignment and technician workflow.'
      )
      return
    }

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const id = selectedReport._id

      if (newStatus === 'Rejected') {
        await api.patch(`/admin/reports/${id}/reject`)
      } else {
        await api.patch(`/admin/reports/${id}/status`, {
          status: newStatus
        })
      }

      setSuccess('Report status updated successfully.')
      setSelectedReport(null)

      await fetchReports()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  // ========================================
  // RESET FILTERS
  // ========================================
  const resetFilters = () => {
    setSearch('')
    setStatusFilter('All')
    setCategoryFilter('All')
    setSeverityFilter('All')
    setPage(1)
  }

  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#123B35]">
            All Reports
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Review and manage community reports submitted by citizens.
          </p>
        </div>

        <button
          onClick={fetchReports}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-[#123B35] hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* SUCCESS MESSAGE */}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <span>{error}</span>
          <button onClick={() => setError('')}>
            <X size={17} />
          </button>
        </div>
      )}

      {/* STATISTICS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Reports"
          value={total}
          icon={ClipboardList}
        />

        <StatCard
          title="Pending"
          value={countStatus('Pending')}
          icon={Clock}
        />

        <StatCard
          title="In Progress"
          value={countStatus('In Progress')}
          icon={AlertCircle}
        />

        <StatCard
          title="Resolved"
          value={countStatus('Resolved')}
          icon={CheckCircle}
        />
      </div>

      <p className="text-xs text-gray-400">
        Status statistics show the reports on the current page. Total Reports
        shows the full database count for the selected filters.
      </p>

      {/* SEARCH AND FILTERS */}
      <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-4">

        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reports on this page..."
            className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-[#16A085]"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">
              Status
            </label>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="w-full rounded-lg border border-gray-200 px-3 py-3 text-sm outline-none focus:border-[#16A085]"
            >
              <option value="All">All Statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">
              Category
            </label>

            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value)
                setPage(1)
              }}
              className="w-full rounded-lg border border-gray-200 px-3 py-3 text-sm outline-none focus:border-[#16A085]"
            >
              <option value="All">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">
              Severity
            </label>

            <select
              value={severityFilter}
              onChange={(e) => {
                setSeverityFilter(e.target.value)
                setPage(1)
              }}
              className="w-full rounded-lg border border-gray-200 px-3 py-3 text-sm outline-none focus:border-[#16A085]"
            >
              <option value="All">All Severities</option>
              {severities.map((severity) => (
                <option key={severity} value={severity}>
                  {severity}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              <Filter size={16} />
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* REPORTS TABLE */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">

        <div className="flex flex-col justify-between gap-2 border-b border-gray-100 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-[#123B35]">
              Community Reports
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Showing {filteredReports.length} of {total} reports on the selected page
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">

            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-5 py-4">Report</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Location</th>
                <th className="px-5 py-4">Severity</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">

              {loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-14 text-center text-gray-500">
                    <RefreshCw size={22} className="mx-auto mb-3 animate-spin text-[#16A085]" />
                    Loading reports from database...
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-14 text-center text-gray-500">
                    <ClipboardList size={30} className="mx-auto mb-3 text-gray-300" />
                    No reports found.
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report._id} className="hover:bg-gray-50">

                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#123B35]">
                        {report.title}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {getReportCode(report)}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {report.category}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      <span className="flex max-w-[190px] items-center gap-1">
                        <MapPin size={14} className="shrink-0" />
                        <span className="truncate">{getLocation(report)}</span>
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <SeverityBadge severity={report.severity} />
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      <span className="flex items-center gap-1">
                        <CalendarDays size={14} />
                        {formatDate(report.createdAt)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={report.status} />
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => openReport(report)}
                        className="flex items-center gap-2 rounded-lg bg-[#E8F5F1] px-3 py-2 font-medium text-[#123B35] hover:bg-[#D5ECE4]"
                      >
                        <Eye size={15} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}

            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex flex-col justify-between gap-3 border-t border-gray-100 p-4 sm:flex-row sm:items-center">
          <p className="text-sm text-gray-500">
            Page {page} of {pages}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1 || loading}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <button
              onClick={() => setPage((current) => Math.min(pages, current + 1))}
              disabled={page >= pages || loading}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* REPORT DETAILS MODAL */}
      {selectedReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
          onClick={() => !saving && setSelectedReport(null)}
        >
          <div
            className="my-auto w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >

            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-[#123B35]">
                  Report Details
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  {getReportCode(selectedReport)}
                </p>
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                disabled={saving}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {detailsLoading ? (
              <div className="py-12 text-center text-gray-500">
                <RefreshCw size={24} className="mx-auto mb-3 animate-spin text-[#16A085]" />
                Loading report details...
              </div>
            ) : (
              <div className="mt-5 max-h-[70vh] space-y-5 overflow-y-auto pr-1">

                {/* TITLE AND DESCRIPTION */}
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">
                    Report title
                  </p>
                  <p className="mt-1 font-semibold text-[#123B35]">
                    {selectedReport.title}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">
                    Description
                  </p>
                  <p className="mt-1 text-sm leading-6 text-gray-700">
                    {selectedReport.description || 'No description provided.'}
                  </p>
                </div>

                {/* REPORT INFORMATION */}
                <div className="grid grid-cols-1 gap-4 rounded-xl bg-gray-50 p-4 sm:grid-cols-2">

                  <DetailItem label="Category" value={selectedReport.category} />

                  <DetailItem
                    label="Severity"
                    value={selectedReport.severity || 'Not specified'}
                  />

                  <DetailItem
                    label="Location"
                    value={getLocation(selectedReport)}
                  />

                  <DetailItem
                    label="Date submitted"
                    value={formatDate(selectedReport.createdAt)}
                  />

                  <DetailItem
                    label="County"
                    value={selectedReport.location?.county || 'Not provided'}
                  />

                  <DetailItem
                    label="Town"
                    value={selectedReport.location?.town || 'Not provided'}
                  />
                </div>

                {/* CITIZEN INFORMATION */}
                <div className="rounded-xl border border-gray-100 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <User size={17} className="text-[#16A085]" />
                    <h3 className="font-semibold text-[#123B35]">
                      Submitted By
                    </h3>
                  </div>

                  <DetailItem
                    label="Citizen name"
                    value={selectedReport.reportedBy?.name || 'Not available'}
                  />

                  <div className="mt-3">
                    <DetailItem
                      label="Email"
                      value={selectedReport.reportedBy?.email || 'Not available'}
                    />
                  </div>

                  <div className="mt-3">
                    <DetailItem
                      label="Phone"
                      value={selectedReport.reportedBy?.phone || 'Not available'}
                    />
                  </div>
                </div>

                {/* REPORT IMAGE */}
                {selectedReport.image?.url ? (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase text-gray-400">
                      Attached Photo
                    </p>

                    <img
                      src={selectedReport.image.url}
                      alt="Community report"
                      className="max-h-64 w-full rounded-xl border border-gray-100 object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-500">
                    <ImageIcon size={18} />
                    No photo attached to this report.
                  </div>
                )}

                {/* ASSIGNED TECHNICIAN */}
                {selectedReport.assignedTo && (
                  <div className="rounded-xl border border-gray-100 p-4">
                    <h3 className="mb-2 font-semibold text-[#123B35]">
                      Assigned Technician
                    </h3>

                    <DetailItem
                      label="Specialization"
                      value={selectedReport.assignedTo.specialization || 'Not available'}
                    />

                    <div className="mt-2">
                      <DetailItem
                        label="Availability"
                        value={selectedReport.assignedTo.availability || 'Not available'}
                      />
                    </div>
                  </div>
                )}

                {/* CURRENT STATUS */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase text-gray-400">
                    Current Status
                  </p>

                  <StatusBadge status={selectedReport.status} />
                </div>

                {/* UPDATE STATUS */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#123B35]">
                    Update Report Status
                  </label>

                  <select
                    value={selectedReport.status}
                    disabled={saving || selectedReport.status === 'Rejected'}
                    onChange={(e) =>
                      setSelectedReport({
                        ...selectedReport,
                        status: e.target.value
                      })
                    }
                    className="w-full rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-[#16A085] disabled:bg-gray-100"
                  >
                    {statuses.map((status) => (
                      <option
                        key={status}
                        value={status}
                        disabled={workflowManagedStatuses.includes(status)}
                      >
                        {status}
                        {workflowManagedStatuses.includes(status)
                          ? ' (Workflow managed)'
                          : ''}
                      </option>
                    ))}
                  </select>

                  {selectedReport.status === 'Rejected' && (
                    <p className="mt-2 text-xs text-red-600">
                      Rejected reports cannot be reopened using the current backend endpoint.
                    </p>
                  )}

                  <p className="mt-2 text-xs text-gray-500">
                    Assigned, In Progress and Resolved statuses are updated through the assignment and technician workflow.
                  </p>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row">

                  <button
                    onClick={updateStatus}
                    disabled={
                      saving ||
                      selectedReport.status === 'Rejected' ||
                      selectedReport.status ===
                        reports.find((r) => r._id === selectedReport._id)?.status
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#123B35] py-3 font-semibold text-white hover:bg-[#19564D] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <RefreshCw size={17} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>

                  <button
                    onClick={() => setSelectedReport(null)}
                    disabled={saving}
                    className="rounded-lg border border-gray-200 px-5 py-3 font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>

              </div>
            )}
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

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
        statusStyles[status] || 'bg-gray-100 text-gray-600'
      }`}
    >
      {status || 'Unknown'}
    </span>
  )
}

function SeverityBadge({ severity }) {
  const styles = {
    Low: 'bg-green-100 text-green-700',
    Medium: 'bg-yellow-100 text-yellow-700',
    High: 'bg-orange-100 text-orange-700',
    Critical: 'bg-red-100 text-red-700'
  }

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
        styles[severity] || 'bg-gray-100 text-gray-600'
      }`}
    >
      {severity || 'Not specified'}
    </span>
  )
}

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-gray-700">
        {value || 'Not provided'}
      </p>
    </div>
  )
}
