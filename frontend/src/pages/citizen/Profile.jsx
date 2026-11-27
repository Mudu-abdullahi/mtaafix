
import { useEffect, useState } from 'react'
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Camera,
  Save,
  Lock,
  Edit3,
} from 'lucide-react'
import api from '../../services/api'

const defaultProfile = {
  name: '',
  email: '',
  phone: '',
  neighbourhood: '',
  bio: 'I care about making my community cleaner, safer, and better.',
}

export default function Profile() {
  const [profile, setProfile] = useState(defaultProfile)
  const [originalProfile, setOriginalProfile] = useState(defaultProfile)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // Load the user's profile from the backend
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await api.get('/profile')

        const user =
          response.data.user ||
          response.data.profile ||
          response.data.data

        if (!user) {
          throw new Error('Profile information was not returned by the server.')
        }

        const savedLocal = JSON.parse(
          localStorage.getItem('mtaafixProfile') || '{}'
        )

        const loadedProfile = {
          ...defaultProfile,
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          neighbourhood: savedLocal.neighbourhood || '',
          bio: savedLocal.bio || defaultProfile.bio,
        }

        setProfile(loadedProfile)
        setOriginalProfile(loadedProfile)
      } catch (err) {
        setError(
          err.response?.data?.message ||
          err.message ||
          'Unable to load your profile. Please try again.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target

    setProfile((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleCancel = () => {
    setProfile(originalProfile)
    setEditing(false)
    setError('')
    setMessage('')
  }

  // Save supported account details to the backend
  const handleSave = async (e) => {
    e.preventDefault()

    try {
      setSaving(true)
      setError('')
      setMessage('')

      const response = await api.patch('/profile', {
        name: profile.name.trim(),
        phone: profile.phone.trim(),
      })

      const updatedUser =
        response.data.user ||
        response.data.profile ||
        response.data.data ||
        {}

      const updatedProfile = {
        ...profile,
        name: updatedUser.name || profile.name.trim(),
        email: updatedUser.email || profile.email,
        phone: updatedUser.phone ?? profile.phone.trim(),
      }

      // Keep neighbourhood and bio locally until backend support is added
      localStorage.setItem(
        'mtaafixProfile',
        JSON.stringify({
          neighbourhood: updatedProfile.neighbourhood,
          bio: updatedProfile.bio,
        })
      )

      setProfile(updatedProfile)
      setOriginalProfile(updatedProfile)
      setEditing(false)
      setMessage('Your profile has been updated successfully.')
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to update your profile. Please try again.'
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="font-medium text-[#123B35]">
          Loading your profile...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl font-bold text-[#123B35]">
          My Profile
        </h1>
        <p className="mt-1 text-gray-500">
          Manage your personal information and account details.
        </p>
      </div>

      {message && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile information card */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-[#E5F4EF] text-[#123B35]">
              <User size={55} />

              <div className="absolute bottom-0 right-0 rounded-full bg-[#16A085] p-2 text-white">
                <Camera size={16} />
              </div>
            </div>

            <h2 className="mt-5 text-xl font-bold text-[#123B35]">
              {profile.name || 'Community Citizen'}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              MtaaFix Citizen
            </p>

            <span className="mt-4 flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-xs font-semibold text-green-700">
              <ShieldCheck size={15} />
              Citizen Account
            </span>
          </div>

          <div className="mt-7 border-t border-gray-100 pt-5">
            <h3 className="font-semibold text-[#123B35]">
              About Me
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              {profile.bio}
            </p>
          </div>
        </div>

        {/* Personal details */}
        <div className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#123B35]">
                Personal Information
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Update your account information.
              </p>
            </div>

            <button
              type="button"
              onClick={editing ? handleCancel : () => setEditing(true)}
              className="flex items-center gap-2 rounded-xl bg-[#E5F4EF] px-4 py-2 text-sm font-semibold text-[#123B35] hover:bg-[#D3ECE3]"
            >
              <Edit3 size={16} />
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  disabled={!editing || saving}
                  required
                  className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none focus:border-[#16A085] disabled:bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  disabled
                  className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none disabled:bg-gray-50"
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">
                Email editing is not available here yet.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="relative">
                <Phone
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  disabled={!editing || saving}
                  placeholder="+254 7XX XXX XXX"
                  className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none focus:border-[#16A085] disabled:bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Neighbourhood / Location
              </label>
              <div className="relative">
                <MapPin
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  name="neighbourhood"
                  value={profile.neighbourhood}
                  onChange={handleChange}
                  disabled={!editing || saving}
                  placeholder="Enter your neighbourhood"
                  className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none focus:border-[#16A085] disabled:bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                About Me
              </label>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                disabled={!editing || saving}
                rows={3}
                className="w-full resize-none rounded-xl border border-gray-200 p-4 outline-none focus:border-[#16A085] disabled:bg-gray-50"
              />
            </div>

            {editing && (
              <button
                type="submit"
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#123B35] py-3 font-semibold text-white transition hover:bg-[#16A085] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Account security */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[#E5F4EF] p-3 text-[#16A085]">
            <Lock size={23} />
          </div>

          <div>
            <h2 className="font-bold text-[#123B35]">
              Account Security
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Your account security settings.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col justify-between gap-3 rounded-xl border border-gray-100 p-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-semibold text-[#123B35]">
              Password
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Password management will be available after backend integration.
            </p>
          </div>

          <span className="w-fit rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-500">
            Coming soon
          </span>
        </div>
      </div>
    </div>
  )
}
