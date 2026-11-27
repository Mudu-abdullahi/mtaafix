
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'
import {
  MapPin,
  Search,
  ClipboardList,
  RefreshCw,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import api from '../../services/api'
import 'leaflet/dist/leaflet.css'

// Fix default Leaflet marker icons in Vite.
const markerIcon = new L.Icon({
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const statusStyles = {
  Assigned: 'bg-blue-100 text-blue-700',
  Accepted: 'bg-purple-100 text-purple-700',
  'In Progress': 'bg-amber-100 text-amber-700',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-gray-100 text-gray-600',
}

function MapBounds({ jobs }) {
  const map = useMap()

  useEffect(() => {
    if (jobs.length === 1) {
      map.setView(
        [jobs[0].latitude, jobs[0].longitude],
        15
      )
    } else if (jobs.length > 1) {
      const bounds = L.latLngBounds(
        jobs.map((job) => [
          job.latitude,
          job.longitude,
        ])
      )

      map.fitBounds(bounds, { padding: [40, 40] })
    }
  }, [jobs, map])

  return null
}

export default function TechnicianMap() {
  const [assignments, setAssignments] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.get('/technician/jobs?limit=50')

      setAssignments(response.data?.assignments || [])
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to load your assigned job locations.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAssignments()
  }, [fetchAssignments])

  // Read GPS coordinates from each assigned report.
  const myAssignments = useMemo(() => {
    return assignments.map((assignment) => {
      const report = assignment.report || {}
      const coordinates = report.location?.coordinates || {}

      const latitude = Number(coordinates.latitude)
      const longitude = Number(coordinates.longitude)

      const hasValidCoordinates =
        coordinates.latitude !== undefined &&
        coordinates.latitude !== null &&
        coordinates.longitude !== undefined &&
        coordinates.longitude !== null &&
        Number.isFinite(latitude) &&
        Number.isFinite(longitude) &&
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180

      return {
        ...assignment,
        report,
        latitude,
        longitude,
        hasValidCoordinates,
      }
    })
  }, [assignments])

  const jobsWithLocations = useMemo(() => {
    return myAssignments.filter(
      (job) => job.hasValidCoordinates
    )
  }, [myAssignments])

  const jobsWithoutLocations = useMemo(() => {
    return myAssignments.filter(
      (job) => !job.hasValidCoordinates
    )
  }, [myAssignments])

  const filteredJobs = useMemo(() => {
    return jobsWithLocations.filter((job) => {
      const report = job.report

      const searchText = [
        report.title,
        report.description,
        report.location?.address,
        report._id,
        job._id,
        job.status,
        job.priority,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return searchText.includes(search.toLowerCase())
    })
  }, [jobsWithLocations, search])

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#123B35]">
            My Job Locations
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View the GPS locations of community repair jobs assigned to you.
          </p>
        </div>

        <button
          onClick={fetchAssignments}
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
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} />
            {error}
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-teal-50 p-3 text-[#16A085]">
              <ClipboardList size={22} />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                My Assigned Jobs
              </p>

              <p className="text-2xl font-bold text-[#123B35]">
                {loading ? '—' : myAssignments.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-3 text-green-600">
              <MapPin size={22} />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                GPS Locations Available
              </p>

              <p className="text-2xl font-bold text-[#123B35]">
                {loading ? '—' : jobsWithLocations.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search your mapped jobs..."
          className="form-input pl-10"
        />
      </div>

      {/* Map */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-4">
          <h2 className="font-semibold text-[#123B35]">
            Assigned Jobs Map
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Select a marker to view job details.
          </p>
        </div>

        <div className="relative h-[450px] w-full">
          {loading ? (
            <div className="flex h-full flex-col items-center justify-center">
              <Loader2
                size={32}
                className="animate-spin text-[#16A085]"
              />

              <p className="mt-3 text-sm text-gray-500">
                Loading job locations...
              </p>
            </div>
          ) : (
            <MapContainer
              center={[-1.286389, 36.817223]}
              zoom={11}
              scrollWheelZoom
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapBounds jobs={filteredJobs} />

              {filteredJobs.map((job) => {
                const report = job.report || {}

                return (
                  <Marker
                    key={job._id}
                    position={[
                      job.latitude,
                      job.longitude,
                    ]}
                    icon={markerIcon}
                  >
                    <Popup>
                      <div className="min-w-48 space-y-1">
                        <strong>
                          {report.title || 'Community repair job'}
                        </strong>

                        <p>
                          Report: {report._id || 'N/A'}
                        </p>

                        <p>
                          Location: {report.location?.address || 'Not provided'}
                        </p>

                        <p>
                          Status: {job.status}
                        </p>

                        <p>
                          Priority: {job.priority || 'Medium'}
                        </p>

                        <p>
                          GPS: {job.latitude}, {job.longitude}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                )
              })}
            </MapContainer>
          )}
        </div>

        {!loading && filteredJobs.length === 0 && (
          <p className="border-t border-gray-100 p-4 text-center text-sm text-gray-500">
            No mapped jobs found. Check that your assigned reports have GPS coordinates.
          </p>
        )}
      </div>

      {/* Jobs without coordinates */}
      {!loading && jobsWithoutLocations.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="font-semibold text-amber-900">
            Jobs without GPS coordinates
          </h2>

          <p className="mt-1 text-sm text-amber-800">
            These assignments do not have usable GPS coordinates in their original reports.
          </p>

          <div className="mt-4 space-y-3">
            {jobsWithoutLocations.map((job) => (
              <div
                key={job._id}
                className="rounded-lg border border-amber-100 bg-white p-3"
              >
                <p className="font-semibold text-[#123B35]">
                  {job.report?.title || 'Community repair job'}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {job.report?.location?.address || 'Location not provided'}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Report ID: {job.report?._id || 'N/A'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
