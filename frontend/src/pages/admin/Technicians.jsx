
import { useEffect, useMemo, useState } from 'react'
import {
  Search,
  Plus,
  UserRound,
  Phone,
  Mail,
  Wrench,
  X,
  Users,
  MapPin,
  RefreshCw,
  Briefcase,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import api from '../../services/api'

const specializations = [
  'Road Maintenance',
  'Electrical Repairs',
  'Drainage and Plumbing',
  'Waste Management',
  'Water Services',
  'General Maintenance',
  'Other'
]

const availabilityOptions = ['Available', 'Busy', 'Unavailable']

const employmentOptions = ['Active', 'Inactive', 'Suspended']

const emptyForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  employeeId: '',
  specialization: '',
  skills: '',
  experienceYears: 0,
  county: '',
  town: '',
  address: ''
}

function getErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.message ||
    'Something went wrong. Please try again.'
  )
}

function getTechnicianName(technician) {
  return technician.user?.name || 'Unnamed Technician'
}

function getTechnicianEmail(technician) {
  return technician.user?.email || 'No email provided'
}

function getTechnicianPhone(technician) {
  return technician.phone || technician.user?.phone || 'No phone provided'
}

function getLocation(technician) {
  const location = technician.location || {}

  return [
    location.town,
    location.county
  ].filter(Boolean).join(', ') || location.address || 'Location not provided'
}

export default function Technicians() {
  const [technicians, setTechnicians] = useState([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [availabilityFilter, setAvailabilityFilter] = useState('All')
  const [employmentFilter, setEmploymentFilter] = useState('All')
  const [specializationFilter, setSpecializationFilter] = useState('All')

  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)

  // ========================================
  // FETCH TECHNICIANS
  // ========================================
  const fetchTechnicians = async () => {
    try {
      setLoading(true)
      setError('')

      const params = {
        page,
        limit: 10
      }

      if (availabilityFilter !== 'All') {
        params.availability = availabilityFilter
      }

      if (employmentFilter !== 'All') {
        params.employmentStatus = employmentFilter
      }

      if (specializationFilter !== 'All') {
        params.specialization = specializationFilter
      }

      const response = await api.get('/technicians', { params })
      const data = response.data

      setTechnicians(data.technicians || [])
      setTotal(data.total || 0)
      setPages(Math.max(1, data.pages || 1))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTechnicians()
  }, [page, availabilityFilter, employmentFilter, specializationFilter])

  // ========================================
  // SEARCH TECHNICIANS ON CURRENT PAGE
  // ========================================
  const filteredTechnicians = useMemo(() => {
    const term = search.trim().toLowerCase()

    if (!term) return technicians

    return technicians.filter((technician) => {
      const values = [
        getTechnicianName(technician),
        getTechnicianEmail(technician),
        getTechnicianPhone(technician),
        technician.specialization,
        technician.employeeId,
        getLocation(technician)
      ]

      return values.some((value) =>
        String(value || '').toLowerCase().includes(term)
      )
    })
  }, [technicians, search])

  // ========================================
  // STATISTICS
  // ========================================
  const availableCount = technicians.filter(
    (technician) => technician.availability === 'Available'
  ).length

  const busyCount = technicians.filter(
    (technician) => technician.availability === 'Busy'
  ).length

  const unavailableCount = technicians.filter(
    (technician) => technician.availability === 'Unavailable'
  ).length

  // ========================================
  // FORM INPUT HANDLER
  // ========================================
  const handleFormChange = (e) => {
    const { name, value } = e.target

    setForm((current) => ({
      ...current,
      [name]: value
    }))
  }

  // ========================================
  // REGISTER TECHNICIAN
  // ========================================
  const addTechnician = async (e) => {
    e.preventDefault()

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      if (form.password.length < 8) {
        setError('Password must contain at least 8 characters.')
        return
      }

      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone.trim(),
        employeeId: form.employeeId.trim() || undefined,
        specialization: form.specialization,
        skills: form.skills
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean),
        experienceYears: Number(form.experienceYears) || 0,
        location: {
          county: form.county.trim(),
          town: form.town.trim(),
          address: form.address.trim()
        }
      }

      await api.post('/technicians', payload)

      setForm(emptyForm)
      setShowForm(false)
      setPage(1)
      setSuccess('Technician registered successfully.')

      if (page !== 1) {
        return
      }

      await fetchTechnicians()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  // ========================================
  // UPDATE AVAILABILITY
  // ========================================
  const updateAvailability = async (id, availability) => {
    try {
      setUpdatingId(id)
      setError('')
      setSuccess('')

      const response = await api.patch(
        `/technicians/${id}/availability`,
        { availability }
      )

      const updatedTechnician = response.data.technician

      setTechnicians((current) =>
        current.map((technician) =>
          technician._id === id ? updatedTechnician : technician
        )
      )

      setSuccess('Technician availability updated successfully.')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setUpdatingId(null)
    }
  }

  // ========================================
  // UPDATE EMPLOYMENT STATUS
  // ========================================
  const updateEmploymentStatus = async (id, employmentStatus) => {
    try {
      setUpdatingId(id)
      setError('')
      setSuccess('')

      const response = await api.patch(
        `/technicians/${id}/employment-status`,
        { employmentStatus }
      )

      const updatedTechnician = response.data.technician

      setTechnicians((current) =>
        current.map((technician) =>
          technician._id === id ? updatedTechnician : technician
        )
      )

      setSuccess('Employment status updated successfully.')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setUpdatingId(null)
    }
  }

  // ========================================
  // RESET FILTERS
  // ========================================
  const resetFilters = () => {
    setSearch('')
    setAvailabilityFilter('All')
    setEmploymentFilter('All')
    setSpecializationFilter('All')
    setPage(1)
  }

  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#123B35]">
            Technicians Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Register technicians and manage their profiles and availability.
          </p>
        </div>

        <button
          onClick={() => {
            setError('')
            setShowForm(true)
          }}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#123B35] px-5 py-3 text-sm font-semibold text-white hover:bg-[#19564D]"
        >
          <Plus size={18} />
          Add Technician
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
          {error}

          <button onClick={() => setError('')}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* STATISTICS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Technicians"
          value={total}
          icon={Users}
        />

        <StatCard
          title="Available"
          value={availableCount}
          icon={UserRound}
        />

        <StatCard
          title="Busy"
          value={busyCount}
          icon={Wrench}
        />

        <StatCard
          title="Unavailable"
          value={unavailableCount}
          icon={Clock}
        />
      </div>

      <p className="text-xs text-gray-400">
        Availability counts show technicians on the current page. Total Technicians
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
            placeholder="Search technicians by name, email, ID or speciality..."
            className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-[#16A085]"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

          <FilterSelect
            label="Specialization"
            value={specializationFilter}
            onChange={(value) => {
              setSpecializationFilter(value)
              setPage(1)
            }}
            options={specializations}
          />

          <FilterSelect
            label="Availability"
            value={availabilityFilter}
            onChange={(value) => {
              setAvailabilityFilter(value)
              setPage(1)
            }}
            options={availabilityOptions}
          />

          <FilterSelect
            label="Employment Status"
            value={employmentFilter}
            onChange={(value) => {
              setEmploymentFilter(value)
              setPage(1)
            }}
            options={employmentOptions}
          />
        </div>

        <button
          onClick={resetFilters}
          className="text-sm font-medium text-[#16A085] hover:underline"
        >
          Reset filters
        </button>
      </div>

      {/* TECHNICIAN CARDS */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

        {loading ? (
          <div className="rounded-xl border border-gray-100 bg-white p-10 text-center text-gray-500 md:col-span-2 xl:col-span-3">
            <RefreshCw size={24} className="mx-auto mb-3 animate-spin text-[#16A085]" />
            Loading technicians from database...
          </div>
        ) : filteredTechnicians.length === 0 ? (
          <div className="rounded-xl border border-gray-100 bg-white p-10 text-center text-gray-500 md:col-span-2 xl:col-span-3">
            <Users size={30} className="mx-auto mb-3 text-gray-300" />
            No technicians found.
          </div>
        ) : (
          filteredTechnicians.map((technician) => (
            <div
              key={technician._id}
              className="rounded-xl border border-gray-100 bg-white p-5"
            >

              {/* CARD HEADER */}
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E8F5F1] text-[#16A085]">
                  <UserRound size={23} />
                </div>

                <AvailabilityBadge
                  availability={technician.availability}
                />
              </div>

              {/* NAME */}
              <h2 className="mt-4 font-bold text-[#123B35]">
                {getTechnicianName(technician)}
              </h2>

              <p className="mt-1 text-xs text-gray-400">
                {technician.employeeId || `ID: ${technician._id.slice(-8).toUpperCase()}`}
              </p>

              {/* DETAILS */}
              <div className="mt-4 space-y-3 text-sm text-gray-600">

                <p className="flex items-center gap-2">
                  <Wrench size={16} className="shrink-0" />
                  {technician.specialization}
                </p>

                <p className="flex items-center gap-2 break-all">
                  <Mail size={16} className="shrink-0" />
                  {getTechnicianEmail(technician)}
                </p>

                <p className="flex items-center gap-2">
                  <Phone size={16} className="shrink-0" />
                  {getTechnicianPhone(technician)}
                </p>

                <p className="flex items-center gap-2">
                  <MapPin size={16} className="shrink-0" />
                  {getLocation(technician)}
                </p>

                <p className="flex items-center gap-2">
                  <Briefcase size={16} className="shrink-0" />
                  {technician.experienceYears || 0} years experience
                </p>
              </div>

              {/* SKILLS */}
              {technician.skills?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {technician.skills.map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {/* EMPLOYMENT STATUS */}
              <div className="mt-5 border-t border-gray-100 pt-4">
                <label className="mb-2 block text-xs font-semibold text-gray-500">
                  Employment Status
                </label>

                <select
                  value={technician.employmentStatus || 'Active'}
                  disabled={updatingId === technician._id}
                  onChange={(e) =>
                    updateEmploymentStatus(
                      technician._id,
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-200 p-2 text-sm outline-none focus:border-[#16A085] disabled:opacity-50"
                >
                  {employmentOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {/* AVAILABILITY */}
              <div className="mt-4">
                <label className="mb-2 block text-xs font-semibold text-gray-500">
                  Update Availability
                </label>

                <select
                  value={technician.availability}
                  disabled={updatingId === technician._id}
                  onChange={(e) =>
                    updateAvailability(
                      technician._id,
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-200 p-2 text-sm outline-none focus:border-[#16A085] disabled:opacity-50"
                >
                  {availabilityOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                {updatingId === technician._id && (
                  <p className="mt-2 text-xs text-[#16A085]">
                    Updating technician...
                  </p>
                )}
              </div>

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

          <div className="flex items-center gap-2">
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

      {/* ADD TECHNICIAN MODAL */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !saving && setShowForm(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#123B35]">
                  Register Technician
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Create a technician profile and login account.
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

            <form onSubmit={addTechnician} className="space-y-4">

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <FormField label="Full name">
                  <input
                    required
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    placeholder="Enter full name"
                    className="form-input"
                  />
                </FormField>

                <FormField label="Email address">
                  <input
                    required
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleFormChange}
                    placeholder="technician@example.com"
                    className="form-input"
                  />
                </FormField>

                <FormField label="Temporary login password">
                  <input
                    required
                    type="password"
                    name="password"
                    minLength={8}
                    value={form.password}
                    onChange={handleFormChange}
                    placeholder="At least 8 characters"
                    className="form-input"
                  />
                </FormField>

                <FormField label="Phone number">
                  <input
                    required
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleFormChange}
                    placeholder="07XXXXXXXX"
                    className="form-input"
                  />
                </FormField>

                <FormField label="Employee ID (optional)">
                  <input
                    name="employeeId"
                    value={form.employeeId}
                    onChange={handleFormChange}
                    placeholder="MTF-TECH-001"
                    className="form-input"
                  />
                </FormField>

                <FormField label="Specialization">
                  <select
                    required
                    name="specialization"
                    value={form.specialization}
                    onChange={handleFormChange}
                    className="form-input"
                  >
                    <option value="">Select specialization</option>

                    {specializations.map((specialization) => (
                      <option key={specialization} value={specialization}>
                        {specialization}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Years of experience">
                  <input
                    type="number"
                    min="0"
                    name="experienceYears"
                    value={form.experienceYears}
                    onChange={handleFormChange}
                    className="form-input"
                  />
                </FormField>

                <FormField label="Skills (comma separated)">
                  <input
                    name="skills"
                    value={form.skills}
                    onChange={handleFormChange}
                    placeholder="Welding, wiring, repairs"
                    className="form-input"
                  />
                </FormField>

                <FormField label="County">
                  <input
                    name="county"
                    value={form.county}
                    onChange={handleFormChange}
                    placeholder="Enter county"
                    className="form-input"
                  />
                </FormField>

                <FormField label="Town">
                  <input
                    name="town"
                    value={form.town}
                    onChange={handleFormChange}
                    placeholder="Enter town"
                    className="form-input"
                  />
                </FormField>

              </div>

              <FormField label="Physical address (optional)">
                <input
                  name="address"
                  value={form.address}
                  onChange={handleFormChange}
                  placeholder="Street, estate or working area"
                  className="form-input"
                />
              </FormField>

              <div className="rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                Share the temporary login password securely with the technician.
                They should use a strong password and change it through a secure
                password-change process when that feature is available.
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#123B35] py-3 font-semibold text-white hover:bg-[#19564D] disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw size={17} className="animate-spin" />
                    Registering...
                  </>
                ) : (
                  'Register Technician'
                )}
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

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-gray-500">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-3 py-3 text-sm outline-none focus:border-[#16A085]"
      >
        <option value="All">All {label}</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}

function AvailabilityBadge({ availability }) {
  const styles = {
    Available: 'bg-green-100 text-green-700',
    Busy: 'bg-amber-100 text-amber-700',
    Unavailable: 'bg-gray-100 text-gray-600'
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        styles[availability] || 'bg-gray-100 text-gray-600'
      }`}
    >
      {availability || 'Unknown'}
    </span>
  )
}
