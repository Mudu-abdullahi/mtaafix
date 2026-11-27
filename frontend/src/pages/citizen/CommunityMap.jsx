
import { useMemo, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from 'react-leaflet'
import { Search, MapPin, Filter, Navigation } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

const sampleReports = [
  {
    id: 'MTF-001',
    title: 'Large pothole on main road',
    category: 'Pothole',
    status: 'Pending',
    location: 'Nairobi CBD',
    position: [-1.2864, 36.8172],
    description: 'A large pothole affecting motorists and pedestrians.',
  },
  {
    id: 'MTF-002',
    title: 'Broken streetlight',
    category: 'Broken Streetlight',
    status: 'In Progress',
    location: 'Westlands',
    position: [-1.2676, 36.8108],
    description: 'Streetlight is not working at night.',
  },
  {
    id: 'MTF-003',
    title: 'Blocked drainage',
    category: 'Blocked Drainage',
    status: 'Resolved',
    location: 'Kilimani',
    position: [-1.2921, 36.7836],
    description: 'Drainage was blocked and caused water accumulation.',
  },
  {
    id: 'MTF-004',
    title: 'Garbage collection problem',
    category: 'Garbage',
    status: 'Pending',
    location: 'Eastleigh',
    position: [-1.2785, 36.8495],
    description: 'Garbage has accumulated near the residential area.',
  },
  {
    id: 'MTF-005',
    title: 'Water leakage',
    category: 'Water Leakage',
    status: 'In Progress',
    location: 'South B',
    position: [-1.3095, 36.8295],
    description: 'Water is leaking from a damaged pipe.',
  },
]

const statusColors = {
  Pending: '#E5A000',
  'In Progress': '#2563EB',
  Resolved: '#16A34A',
}

function MapView({ reports }) {
  const map = useMap()

  return (
    <>
      {reports.map((report) => (
        <CircleMarker
          key={report.id}
          center={report.position}
          radius={10}
          pathOptions={{
            color: statusColors[report.status] || '#64748B',
            fillColor: statusColors[report.status] || '#64748B',
            fillOpacity: 0.8,
            weight: 2,
          }}
        >
          <Popup>
            <div className="min-w-40">
              <h3 className="font-bold">{report.title}</h3>
              <p className="mt-1 text-sm">{report.category}</p>
              <p className="text-sm">{report.location}</p>
              <p
                className="mt-2 text-sm font-semibold"
                style={{ color: statusColors[report.status] }}
              >
                {report.status}
              </p>
              <p className="mt-2 text-xs">{report.description}</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </>
  )
}

export default function CommunityMap() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')

  const reports = useMemo(() => {
    const saved = JSON.parse(
      localStorage.getItem('mtaafixReports') || '[]'
    )

    const localReports = saved
      .filter((report) => {
        return (
          Number.isFinite(Number(report.latitude)) &&
          Number.isFinite(Number(report.longitude))
        )
      })
      .map((report) => ({
        ...report,
        position: [
          Number(report.latitude),
          Number(report.longitude),
        ],
      }))

    return [...sampleReports, ...localReports]
  }, [])

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      (report.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (report.category || '').toLowerCase().includes(search.toLowerCase()) ||
      (report.location || '').toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      status === 'All' || report.status === status

    return matchesSearch && matchesStatus
  })

  const counts = {
    total: reports.length,
    pending: reports.filter((r) => r.status === 'Pending').length,
    progress: reports.filter((r) => r.status === 'In Progress').length,
    resolved: reports.filter((r) => r.status === 'Resolved').length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#123B35]">
          Community Map
        </h1>
        <p className="mt-1 text-gray-500">
          Explore reported problems and see what's happening in your community.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total Reports', value: counts.total },
          { label: 'Pending', value: counts.pending },
          { label: 'In Progress', value: counts.progress },
          { label: 'Resolved', value: counts.resolved },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">{item.label}</p>
            <h2 className="mt-2 text-2xl font-bold text-[#123B35]">
              {item.value}
            </h2>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search location or problem..."
            className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none focus:border-[#16A085]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-500" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#16A085]"
          >
            <option value="All">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white p-3 shadow-sm">
        <div className="mb-3 flex items-center justify-between px-2 py-2">
          <h2 className="font-bold text-[#123B35]">
            Report Locations
          </h2>
          <span className="text-sm text-gray-500">
            {filteredReports.length} locations
          </span>
        </div>

        <MapContainer
          center={[-1.2864, 36.8172]}
          zoom={12}
          scrollWheelZoom={true}
          className="z-0 h-[450px] w-full rounded-xl"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapView reports={filteredReports} />
        </MapContainer>

        <div className="flex flex-wrap gap-5 px-3 py-5">
          {Object.entries(statusColors).map(([label, color]) => (
            <div key={label} className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-bold text-[#123B35]">
          Reported Problems
        </h2>

        <div className="space-y-3">
          {filteredReports.length === 0 ? (
            <p className="py-6 text-center text-gray-500">
              No reports match your search.
            </p>
          ) : (
            filteredReports.map((report) => (
              <div
                key={report.id}
                className="flex flex-col justify-between gap-3 rounded-xl border border-gray-100 p-4 sm:flex-row sm:items-center"
              >
                <div>
                  <h3 className="font-semibold text-[#123B35]">
                    {report.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {report.category}
                  </p>
                  <p className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                    <MapPin size={14} />
                    {report.location || 'Location provided'}
                  </p>
                </div>

                <span
                  className="w-fit rounded-full px-3 py-1 text-xs font-semibold"
                  style={{
                    color: statusColors[report.status] || '#64748B',
                    backgroundColor: `${statusColors[report.status] || '#64748B'}18`,
                  }}
                >
                  {report.status || 'Pending'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
