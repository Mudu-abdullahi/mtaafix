
import { useEffect, useState } from 'react'
import {
  Camera,
  MapPin,
  AlertTriangle,
  Lightbulb,
  Trash2,
  Droplets,
  Construction,
  Zap,
  CheckCircle2,
  X,
  Sparkles,
  Send,
} from 'lucide-react'
import api from '../../services/api'

const categories = [
  { name: 'Pothole', icon: Construction },
  { name: 'Broken Streetlight', icon: Lightbulb },
  { name: 'Garbage', icon: Trash2 },
  { name: 'Blocked Drainage', icon: Droplets },
  { name: 'Water Leakage', icon: Droplets },
  { name: 'Exposed Electrical Wires', icon: Zap },
  { name: 'Other', icon: AlertTriangle },
]

const initialForm = {
  title: '',
  category: '',
  description: '',
  location: '',
}

export default function ReportProblem() {
  const [form, setForm] = useState(initialForm)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [coordinates, setCoordinates] = useState('')
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  const updateForm = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      return
    }

    setError('')
    setLoadingLocation(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const gps = `${latitude}, ${longitude}`

        setCoordinates(gps)

        setForm((prev) => ({
          ...prev,
          location: prev.location || `GPS coordinates: ${gps}`,
        }))

        setLoadingLocation(false)
      },
      () => {
        setError(
          'Unable to get your location. Please enter it manually.'
        )
        setLoadingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    )
  }

  const handleImage = (e) => {
    const file = e.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Please select an image smaller than 5MB.')
      return
    }

    setError('')
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const resetForm = () => {
    setForm(initialForm)
    setCoordinates('')
    removeImage()
    setError('')
    setSuccessMessage('')
    setSubmitted(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')

    if (
      !form.title.trim() ||
      !form.category ||
      !form.description.trim() ||
      !form.location.trim()
    ) {
      setError('Please complete all required fields.')
      return
    }

    try {
      setSubmitting(true)

      const locationData = {
        address: form.location.trim(),
      }

      if (coordinates) {
        const [latitude, longitude] = coordinates
          .split(',')
          .map(Number)

        locationData.coordinates = {
          latitude,
          longitude,
        }
      }

      const reportData = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        location: locationData,
        severity: 'Medium',
        image: {},
      }

      const response = await api.post('/reports', reportData)

      setSuccessMessage(
        response.data.message ||
        'Your community report has been submitted successfully.'
      )

      setSubmitted(true)
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to submit your report. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckCircle2 size={42} />
        </div>

        <h2 className="text-2xl font-bold text-[#123B35]">
          Report Submitted!
        </h2>

        <p className="mt-3 text-gray-500">
          {successMessage}
        </p>

        <p className="mt-2 text-sm text-gray-500">
          Thank you for helping improve your community.
          You can track your report from My Reports.
        </p>

        <button
          type="button"
          onClick={resetForm}
          className="mt-7 rounded-xl bg-[#123B35] px-6 py-3 text-white hover:bg-[#16A085]"
        >
          Submit Another Report
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#123B35]">
          Report a Community Problem
        </h1>
        <p className="mt-1 text-gray-500">
          Help make your neighbourhood safer and better.
        </p>
      </div>

      <div className="flex items-center gap-4 rounded-2xl bg-[#123B35] p-6 text-white">
        <div className="rounded-xl bg-white/10 p-3">
          <Sparkles size={28} />
        </div>

        <div>
          <h3 className="font-semibold">
            AI-assisted reporting
          </h3>
          <p className="mt-1 text-sm text-gray-200">
            MtaaFix will help classify and prioritize reports
            when AI services are connected.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl bg-white p-6 shadow-sm"
      >
        {/* Problem information */}
        <div>
          <h2 className="text-lg font-bold text-[#123B35]">
            1. Problem Information
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Tell us what is happening.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Problem title *
          </label>

          <input
            name="title"
            value={form.title}
            onChange={updateForm}
            placeholder="e.g. Large pothole near the main road"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#16A085]"
            required
          />
        </div>

        <div>
          <label className="mb-3 block text-sm font-medium">
            Select problem category *
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const Icon = category.icon

              return (
                <button
                  type="button"
                  key={category.name}
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      category: category.name,
                    }))
                  }
                  className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                    form.category === category.name
                      ? 'border-[#16A085] bg-green-50 text-[#123B35]'
                      : 'border-gray-200 hover:border-[#16A085]'
                  }`}
                >
                  <Icon size={22} />
                  <span className="text-sm font-medium">
                    {category.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Problem description *
          </label>

          <textarea
            name="description"
            value={form.description}
            onChange={updateForm}
            rows={5}
            placeholder="Explain the problem, where it is located, and how it affects the community..."
            className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#16A085]"
            required
          />
        </div>

        {/* Evidence */}
        <div className="border-t border-gray-100 pt-6">
          <h2 className="text-lg font-bold text-[#123B35]">
            2. Upload Evidence
          </h2>

          <p className="mb-4 mt-1 text-sm text-gray-500">
            Select a photograph showing the problem.
          </p>

          <div className="rounded-xl border-2 border-dashed border-gray-300 p-8 transition hover:border-[#16A085]">
            {imagePreview ? (
              <div className="flex flex-col items-center">
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Problem evidence preview"
                    className="max-h-64 rounded-xl object-cover"
                  />

                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -right-3 -top-3 rounded-full bg-red-500 p-1 text-white"
                    aria-label="Remove selected image"
                  >
                    <X size={16} />
                  </button>
                </div>

                <p className="mt-3 text-sm text-gray-500">
                  {imageFile?.name}
                </p>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center">
                <Camera size={35} className="mb-3 text-gray-400" />

                <span className="font-medium text-gray-700">
                  Click to upload a photo
                </span>

                <span className="mt-2 text-xs text-gray-400">
                  Image files only, maximum 5MB
                </span>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImage}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <p className="mt-2 text-xs text-amber-700">
            Photo preview is available, but permanent image uploading
            will be enabled after image storage integration.
          </p>
        </div>

        {/* Location */}
        <div className="border-t border-gray-100 pt-6">
          <h2 className="text-lg font-bold text-[#123B35]">
            3. Problem Location
          </h2>

          <p className="mb-4 mt-1 text-sm text-gray-500">
            Tell us exactly where the problem is.
          </p>

          <button
            type="button"
            onClick={getLocation}
            disabled={loadingLocation || submitting}
            className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-[#123B35] hover:bg-green-100 disabled:opacity-50"
          >
            <MapPin size={19} />
            {loadingLocation
              ? 'Getting location...'
              : 'Use My Current Location'}
          </button>

          {coordinates && (
            <p className="mt-2 text-xs text-green-700">
              GPS coordinates: {coordinates}
            </p>
          )}

          <input
            name="location"
            value={form.location}
            onChange={updateForm}
            placeholder="Enter estate, street, town or GPS coordinates"
            className="mt-3 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#16A085]"
            required
          />
        </div>

        {/* Safety warning */}
        <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle
            className="shrink-0 text-amber-600"
            size={22}
          />

          <p className="text-sm text-amber-800">
            For dangerous electrical wires or other urgent hazards,
            keep a safe distance and do not attempt repairs yourself.
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#123B35] py-4 font-semibold text-white transition hover:bg-[#16A085] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send size={19} />
          {submitting ? 'Submitting Report...' : 'Submit Community Report'}
        </button>

        <p className="text-center text-xs text-gray-400">
          Your report will be submitted securely to the MtaaFix server.
        </p>
      </form>
    </div>
  )
}
