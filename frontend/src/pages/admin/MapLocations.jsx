
import { useEffect, useMemo, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from 'react-leaflet'
import L from 'leaflet'
import {
  MapPin,
  Search,
  RefreshCw,
  AlertCircle,
  ClipboardList,
  CheckCircle,
  Clock,
  Navigation
} from 'lucide-react'
import api from '../../services/api'
import 'leaflet/dist/leaflet.css'

// Fix default Leaflet marker images in Vite
const markerIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const statusStyles = {
  Pending: 'bg-amber-100 text-amber-700',
  'Under Review': 'bg-yellow-100 text-yellow-700',
  Verified: 'bg-blue-100 text-blue-700',
  Assigned: 'bg-purple-100 text-purple-700',
  'In Progress': 'bg-indigo-100 text-indigo-700',
  Resolved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700'
}

function getCoordinates(report) {
  const coordinates = report.location?.coordinates

  const latitude = Number(coordinates?.latitude)
  const longitude = Number(coordinates?.longitude)

  if (
    coordinates &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180 &&
    !(latitude === 0 && longitude === 0)
  ) {
    return [latitude, longitude]
  }

  return null
}

function MapUpdater({ selectedPosition }) {
  const map = useMap()

  useEffect(() => {
    if (selectedPosition) {
      map.flyTo(selectedPosition, 15, {
        duration: 1
      })
    }
  }, [selectedPosition, map])

  return null
}

export default function MapLocations() {
  const [reports, setReports] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedPosition, setSelectedPosition] = useState(null)
  const [selectedReport, setSelectedReport] = useState(null)

  const fetchReports = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.get('/admin/reports', {
        params: {
          page: 1,
          limit: 50
        }
      })

      setReports(response.data.reports || [])
    } catch (err) {
      console.error('Failed to load map reports:', err)

      setError(
        err.response?.data?.message ||
        'Unable to load community reports.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const location = report.location?.address || ''

      const matchesSearch = [
        report.title,
        report.category,
        location,
        report.status
      ].some((value) =>
        String(value || '')
          .toLowerCase()
          .includes(search.toLowerCase())
      )

      const matchesStatus =
        statusFilter === 'All' ||
        report.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [reports, search, statusFilter])

  const mappedReports = filteredReports.filter(
    (report) => getCoordinates(report)
  )

  const reportsWithoutCoordinates = filteredReports.filter(
    (report) => !getCoordinates(report)
  )

  const countStatus = (status) =>
    reports.filter((report) => report.status === status).length

  const handleSelectReport = (report) => {
    const position = getCoordinates(report)

    setSelectedReport(report)

    if (position) {
      setSelectedPosition(position)
    }
  }

  const formatDate = (date) => {
    if (!date) return 'Not provided'

    return new Date(date).toLocaleDateString('en-KE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#123B35]">
            Map Locations
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Explore community reports and their geographical locations.
          </p>
        </div>

        <button
          onClick={fetchReports}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#123B35] px-5 py-3 text-sm font-semibold text-white hover:bg-[#19564D] disabled:opacity-50"
        >
          <RefreshCw
            size={18}
            className={loading ? 'animate-spin' : ''}
          />
          Refresh Map
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Reports"
          value={reports.length}
          icon={ClipboardList}
        />

        <StatCard
          title="Mapped Locations"
          value={reports.filter((report) => getCoordinates(report)).length}
          icon={MapPin}
        />

        <StatCard
          title="Resolved Reports"
          value={countStatus('Resolved')}
          icon={CheckCircle}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 md:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, category or location..."
            className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-[#16A085]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#16A085]"
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Under Review">Under Review</option>
          <option value="Verified">Verified</option>
          <option value="Assigned">Assigned</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Map */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-2 border-b border-gray-100 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-bold text-[#123B35]">
              Community Reports Map
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {mappedReports.length} report locations displayed on the map
            </p>
          </div>

          <span className="flex items-center gap-2 text-xs text-gray-500">
            <span className="h-2.5 w-2.5 rounded-full bg-[#16A085]" />
            GPS locations
          </span>
        </div>

        <div className="relative h-[450px] w-full sm:h-[550px]">
          {loading ? (
            <div className="flex h-full items-center justify-center text-gray-500">
              <RefreshCw size={20} className="mr-3 animate-spin" />
              Loading map locations...
            </div>
          ) : (
            <MapContainer
              center={[-1.286389, 36.817223]}
              zoom={11}
              scrollWheelZoom={true}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapUpdater selectedPosition={selectedPosition} />

              {mappedReports.map((report) => {
                const position = getCoordinates(report)

                return (
                  <Marker
                    key={report._id}
                    position={position}
                    icon={markerIcon}
                    eventHandlers={{
                      click: () => setSelectedReport(report)
                    }}
                  >
                    <Popup>
                      <div className="min-w-[190px]">
                        <h3 className="font-bold text-[#123B35]">
                          {report.title}
                        </h3>

                        <p className="mt-1 text-sm text-gray-600">
                          {report.category}
                        </p>

                        <p className="mt-2 text-xs text-gray-500">
                          {report.location?.address || 'Location not provided'}
                        </p>

                        <p className="mt-2 text-xs font-semibold">
                          Status: {report.status}
                        </p>

                        <button
                          onClick={() => setSelectedReport(report)}
                          className="mt-3 rounded-lg bg-[#123B35] px-3 py-2 text-xs font-semibold text-white"
                        >
                          View Details
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                )
              })}
            </MapContainer>
          )}
        </div>

        {!loading && mappedReports.length === 0 && (
          <div className="border-t border-gray-100 p-4 text-center text-sm text-gray-500">
            No GPS coordinates are available for the selected reports.
            The map is showing Nairobi as its default view.
          </div>
        )}
      </div>

      {/* Reports List */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
        <div className="border-b border-gray-100 p-5">
          <h2 className="font-semibold text-[#123B35]">
            Report Locations
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Showing {filteredReports.length} reports
          </p>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredReports.length > 0 ? (
            filteredReports.map((report) => {
              const position = getCoordinates(report)

              return (
                <div
                  key={report._id}
                  className="flex flex-col justify-between gap-4 p-5 transition hover:bg-gray-50 sm:flex-row sm:items-center"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-[#E8F5F1] p-3 text-[#16A085]">
                      <MapPin size={20} />
                    </div>

                    <div>
                      <h3 className="font-semibold text-[#123B35]">
                        {report.title}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {report.category}
                      </p>

                      <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                        <Navigation size={13} />
                        {report.location?.address || 'Address not provided'}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {formatDate(report.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        statusStyles[report.status] ||
                        'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {report.status}
                    </span>

                    {position ? (
                      <button
                        onClick={() => handleSelectReport(report)}
                        className="flex items-center gap-2 rounded-lg bg-[#E8F5F1] px-3 py-2 text-xs font-semibold text-[#123B35] hover:bg-[#D5ECE4]"
                      >
                        <MapPin size={15} />
                        View on Map
                      </button>
                    ) : (
                      <span className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                        GPS unavailable
                      </span>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="p-10 text-center text-sm text-gray-500">
              No community reports found.
            </div>
          )}
        </div>
      </div>

      {/* Reports without GPS */}
      {reportsWithoutCoordinates.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle
              size={22}
              className="shrink-0 text-amber-600"
            />

            <div>
              <h3 className="font-semibold text-amber-800">
                Reports without GPS coordinates
              </h3>

              <p className="mt-1 text-sm text-amber-700">
                {reportsWithoutCoordinates.length} reports do not currently
                have valid GPS coordinates and cannot be placed accurately
                on the map.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Selected Report Details */}
      {selectedReport && (
        <div className="rounded-xl border border-[#D5ECE4] bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#16A085]">
                Selected Report
              </p>

              <h2 className="mt-2 text-lg font-bold text-[#123B35]">
                {selectedReport.title}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {selectedReport.category}
              </p>
            </div>

            <button
              onClick={() => setSelectedReport(null)}
              className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100"
            >
              Close
            </button>
          </div>

          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-gray-400">Location</p>
              <p className="mt-1 font-medium text-gray-700">
                {selectedReport.location?.address || 'Not provided'}
              </p>
            </div>

            <div>
              <p className="text-gray-400">Status</p>
              <p className="mt-1 font-medium text-gray-700">
                {selectedReport.status}
              </p>
            </div>

            <div>
              <p className="text-gray-400">Priority</p>
              <p className="mt-1 font-medium text-gray-700">
                {selectedReport.priority || 'Not assigned'}
              </p>
            </div>

            <div>
              <p className="text-gray-400">Date submitted</p>
              <p className="mt-1 font-medium text-gray-700">
                {formatDate(selectedReport.createdAt)}
              </p>
            </div>
          </div>

          {selectedReport.description && (
            <div className="mt-4">
              <p className="text-sm text-gray-400">Description</p>
              <p className="mt-1 text-sm leading-6 text-gray-700">
                {selectedReport.description}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

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
