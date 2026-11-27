
import { useCallback, useEffect, useState } from 'react'
import {
  User,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Save,
  ShieldCheck,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import api from '../../services/api'

export default function TechnicianProfile() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
  })

  const [technician, setTechnician] = useState(null)
  const [availability, setAvailability] = useState('Available')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [availabilitySaving, setAvailabilitySaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.get('/profile')
      const user = response.data?.user || response.data?.profile || response.data

      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      })

      // Technician details are shown when supplied by the profile API.
      if (response.data?.technician) {
        setTechnician(response.data.technician)
        setAvailability(
          response.data.technician.availability || 'Available'
        )
      } else {
        setTechnician(null)
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to load your profile.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleChange = (e) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }))
    setMessage('')
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.name.trim()) {
      setError('Please enter your full name.')
      return
    }

    try {
      setSaving(true)
      setError('')
      setMessage('')

      await api.patch('/profile', {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      })

      setMessage('Your personal information has been updated successfully.')

      // Keep the locally cached account details in sync.
      const savedUser = JSON.parse(
        localStorage.getItem('mtaafix_user') || '{}'
      )

      localStorage.setItem(
        'mtaafix_user',
        JSON.stringify({
          ...savedUser,
          ...form,
        })
      )
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to update your profile.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleAvailability = async (e) => {
    const newAvailability = e.target.value

    try {
      setAvailabilitySaving(true)
      setError('')
      setMessage('')

      await api.patch('/technician/availability', {
        availability: newAvailability,
      })

      setAvailability(newAvailability)

      setTechnician((previous) => ({
        ...previous,
        availability: newAvailability,
      }))

      setMessage('Your availability has been updated successfully.')
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to update your availability.'
      )
    } finally {
      setAvailabilitySaving(false)
    }
  }

  const fields = [
    {
      name: 'name',
      label: 'Full Name',
      placeholder: 'Enter your full name',
      icon: User,
      required: true,
    },
    {
      name: 'email',
      label: 'Email Address',
      placeholder: 'Enter your email',
      icon: Mail,
      type: 'email',
      required: true,
    },
    {
      name: 'phone',
      label: 'Phone Number',
      placeholder: 'Enter your phone number',
      icon: Phone,
    },
  ]

  if (loading) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#16A085]" />
        <p className="mt-3 text-sm text-gray-500">
          Loading your profile...
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#123B35]">
            My Profile
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your professional and contact information.
          </p>
        </div>

        <button
          onClick={fetchProfile}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {message && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle2 size={18} />
          {message}
        </div>
      )}

      {/* Profile Banner */}
      <div className="rounded-xl bg-[#123B35] p-6 text-white shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#16A085] text-2xl font-bold">
            {form.name
              ? form.name.charAt(0).toUpperCase()
              : 'T'}
          </div>

          <div>
            <h2 className="text-xl font-bold">
              {form.name || 'Technician'}
            </h2>

            <p className="mt-1 text-sm text-gray-200">
              MtaaFix Technical Team
            </p>

            {technician?.employeeId && (
              <p className="mt-1 text-xs text-green-200">
                Employee ID: {technician.employeeId}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 text-sm text-green-200">
          <ShieldCheck size={18} />
          Technician Portal Profile
        </div>
      </div>

      {/* Personal Information */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
      >
        <h2 className="mb-6 text-lg font-semibold text-[#123B35]">
          Personal Information
        </h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {fields.map((field) => {
            const Icon = field.icon

            return (
              <div key={field.name} className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {field.label}
                  {field.required && (
                    <span className="text-red-500"> *</span>
                  )}
                </label>

                <div className="relative">
                  <Icon
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    name={field.name}
                    type={field.type || 'text'}
                    value={form[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    required={field.required || false}
                    className="form-input pl-10"
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-[#16A085] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#12836d] disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <Save size={17} />
            )}
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>

      {/* Professional Information */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-[#123B35]">
          Professional Information
        </h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500">Specialization</p>
            <p className="mt-1 flex items-center gap-2 font-medium text-[#123B35]">
              <Briefcase size={17} className="text-[#16A085]" />
              {technician?.specialization || 'Not provided'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Work Location</p>
            <p className="mt-1 flex items-center gap-2 font-medium text-[#123B35]">
              <MapPin size={17} className="text-[#16A085]" />
              {[
                technician?.location?.town,
                technician?.location?.county,
              ].filter(Boolean).join(', ') || 'Not provided'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Experience</p>
            <p className="mt-1 font-medium text-[#123B35]">
              {technician?.experienceYears !== undefined
                ? `${technician.experienceYears} years`
                : 'Not provided'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Employment Status</p>
            <p className="mt-1 font-medium text-[#123B35]">
              {technician?.employmentStatus || 'Not provided'}
            </p>
          </div>
        </div>

        <p className="mt-5 rounded-lg bg-blue-50 p-3 text-xs text-blue-800">
          Professional details are managed through the administrator until technician self-service editing is enabled.
        </p>
      </div>

      {/* Availability */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-teal-50 p-3 text-[#16A085]">
            <Clock size={22} />
          </div>

          <div>
            <h2 className="font-semibold text-[#123B35]">
              Work Availability
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Let the administrator know whether you can receive new jobs.
            </p>
          </div>
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Availability Status
          </label>

          <select
            value={availability}
            onChange={handleAvailability}
            disabled={availabilitySaving}
            className="form-input sm:max-w-sm"
          >
            <option value="Available">Available</option>
            <option value="Unavailable">Unavailable</option>
          </select>

          {availabilitySaving && (
            <p className="mt-2 text-xs text-gray-500">
              Updating availability...
            </p>
          )}

          {availability === 'Available' && (
            <p className="mt-2 text-xs text-green-700">
              You are available to receive new assignments.
            </p>
          )}

          {availability === 'Unavailable' && (
            <p className="mt-2 text-xs text-amber-700">
              You are currently unavailable for new assignments.
            </p>
          )}
        </div>
      </div>

    </div>
  )
}
