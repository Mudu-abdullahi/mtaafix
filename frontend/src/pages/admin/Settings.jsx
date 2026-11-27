
import { useEffect, useState } from 'react'
import {
  Settings as SettingsIcon,
  Building2,
  Mail,
  Phone,
  Save,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  Wrench,
  MessageSquare
} from 'lucide-react'
import api from '../../services/api'

export default function Settings() {
  const [form, setForm] = useState({
    businessName: 'MtaaFix',
    acceptingRequests: true,
    maintenanceMode: false,
    contactEmail: '',
    contactPhone: '',
    supportMessage: 'Together, We Fix Our Communities.'
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.get('/admin/settings')

      if (response.data.settings) {
        setForm((current) => ({
          ...current,
          ...response.data.settings
        }))
      }
    } catch (err) {
      console.error('Settings loading error:', err)

      setError(
        err.response?.data?.message ||
        'Unable to load system settings.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const response = await api.patch('/admin/settings', form)

      if (response.data.settings) {
        setForm((current) => ({
          ...current,
          ...response.data.settings
        }))
      }

      setSuccess('System settings saved successfully.')
    } catch (err) {
      console.error('Settings save error:', err)

      setError(
        err.response?.data?.message ||
        'Unable to save settings. Please try again.'
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[350px] items-center justify-center text-gray-500">
        <RefreshCw size={22} className="mr-3 animate-spin" />
        Loading system settings...
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-[#123B35]">
            <SettingsIcon size={25} />
            System Settings
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Configure your MtaaFix platform preferences.
          </p>
        </div>

        <button
          onClick={fetchSettings}
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={17} />
          Reload Settings
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle size={20} />
          {success}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">

        {/* General Settings */}
        <section className="rounded-xl border border-gray-100 bg-white p-5 sm:p-6">
          <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="rounded-lg bg-[#E8F5F1] p-3 text-[#16A085]">
              <Building2 size={22} />
            </div>

            <div>
              <h2 className="font-bold text-[#123B35]">
                General Information
              </h2>

              <p className="text-sm text-gray-500">
                Basic information about your platform.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Platform Name
              </label>

              <input
                type="text"
                name="businessName"
                value={form.businessName}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#16A085]"
                placeholder="MtaaFix"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Platform Message
              </label>

              <div className="relative">
                <MessageSquare
                  size={18}
                  className="absolute left-3 top-3.5 text-gray-400"
                />

                <textarea
                  name="supportMessage"
                  value={form.supportMessage}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-[#16A085]"
                  placeholder="Enter your platform message..."
                />
              </div>
            </div>
          </div>
        </section>

        {/* Contact Settings */}
        <section className="rounded-xl border border-gray-100 bg-white p-5 sm:p-6">
          <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <Mail size={22} />
            </div>

            <div>
              <h2 className="font-bold text-[#123B35]">
                Contact Information
              </h2>

              <p className="text-sm text-gray-500">
                Configure platform contact details.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Contact Email
              </label>

              <div className="relative">
                <Mail
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="email"
                  name="contactEmail"
                  value={form.contactEmail}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-[#16A085]"
                  placeholder="support@example.com"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Contact Phone
              </label>

              <div className="relative">
                <Phone
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="tel"
                  name="contactPhone"
                  value={form.contactPhone}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-[#16A085]"
                  placeholder="+254..."
                />
              </div>
            </div>
          </div>
        </section>

        {/* Platform Controls */}
        <section className="rounded-xl border border-gray-100 bg-white p-5 sm:p-6">
          <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="rounded-lg bg-amber-50 p-3 text-amber-600">
              <ShieldCheck size={22} />
            </div>

            <div>
              <h2 className="font-bold text-[#123B35]">
                Platform Controls
              </h2>

              <p className="text-sm text-gray-500">
                Configure report acceptance and maintenance preferences.
              </p>
            </div>
          </div>

          <div className="space-y-5">

            {/* Accept Requests */}
            <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 p-4">
              <div>
                <h3 className="font-semibold text-[#123B35]">
                  Accept Community Reports
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Enable or disable new report submissions.
                </p>
              </div>

              <Toggle
                name="acceptingRequests"
                checked={form.acceptingRequests}
                onChange={handleChange}
              />
            </div>

            {/* Maintenance Mode */}
            <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 p-4">
              <div>
                <h3 className="flex items-center gap-2 font-semibold text-[#123B35]">
                  <Wrench size={17} />
                  Maintenance Mode
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Set the platform maintenance preference.
                </p>
              </div>

              <Toggle
                name="maintenanceMode"
                checked={form.maintenanceMode}
                onChange={handleChange}
              />
            </div>

          </div>
        </section>

        {/* Save */}
        <div className="flex flex-col justify-between gap-3 rounded-xl border border-gray-100 bg-white p-5 sm:flex-row sm:items-center">
          <p className="text-sm text-gray-500">
            Your changes will be saved to the MtaaFix database.
          </p>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#123B35] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#19564D] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Settings
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  )
}

function Toggle({ name, checked, onChange }) {
  return (
    <label className="relative inline-flex cursor-pointer items-center">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />

      <div className="h-6 w-11 rounded-full bg-gray-200 transition peer-checked:bg-[#16A085] after:absolute after:left-[3px] after:top-[3px] after:h-[18px] after:w-[18px] after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-5" />
    </label>
  )
}
