
import { useEffect, useState } from 'react'
import {
  Bell,
  CheckCircle,
  Clock,
  AlertTriangle,
  ClipboardList,
  Trash2,
  CheckCheck,
  MapPin,
  RefreshCw,
} from 'lucide-react'
import api from '../../services/api'

const notificationStyles = {
  'Report Submitted': {
    icon: CheckCircle,
    color: 'text-green-600',
    background: 'bg-green-100',
  },
  'Report Updated': {
    icon: Bell,
    color: 'text-blue-600',
    background: 'bg-blue-100',
  },
  'Report Verified': {
    icon: CheckCircle,
    color: 'text-teal-600',
    background: 'bg-teal-100',
  },
  'Report Rejected': {
    icon: AlertTriangle,
    color: 'text-red-600',
    background: 'bg-red-100',
  },
  'Assignment Created': {
    icon: ClipboardList,
    color: 'text-blue-600',
    background: 'bg-blue-100',
  },
  'Assignment Accepted': {
    icon: Clock,
    color: 'text-indigo-600',
    background: 'bg-indigo-100',
  },
  'Job Started': {
    icon: Clock,
    color: 'text-yellow-600',
    background: 'bg-yellow-100',
  },
  'Job Completed': {
    icon: CheckCheck,
    color: 'text-emerald-600',
    background: 'bg-emerald-100',
  },
  'Report Resolved': {
    icon: CheckCircle,
    color: 'text-green-600',
    background: 'bg-green-100',
  },
  'System Alert': {
    icon: AlertTriangle,
    color: 'text-orange-600',
    background: 'bg-orange-100',
  },
  General: {
    icon: MapPin,
    color: 'text-purple-600',
    background: 'bg-purple-100',
  },
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState('')

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.get('/notifications')

      setNotifications(response.data.notifications || [])
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to load notifications. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  // Backend uses isRead; the UI displays read.
  const unreadCount = notifications.filter(
    (item) => !item.isRead
  ).length

  const filteredNotifications = notifications.filter((item) => {
    if (filter === 'Unread') return !item.isRead
    if (filter === 'Read') return item.isRead
    return true
  })

  const markAllRead = async () => {
    try {
      setActionLoading('all')

      await api.patch('/notifications/read-all')

      setNotifications((previous) =>
        previous.map((item) => ({ ...item, isRead: true }))
      )
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Could not mark all notifications as read.'
      )
    } finally {
      setActionLoading('')
    }
  }

  const markRead = async (id) => {
    try {
      setActionLoading(id)

      await api.patch(`/notifications/${id}/read`)

      setNotifications((previous) =>
        previous.map((item) =>
          item._id === id ? { ...item, isRead: true } : item
        )
      )
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Could not mark notification as read.'
      )
    } finally {
      setActionLoading('')
    }
  }

  const deleteNotification = async (id) => {
    try {
      setActionLoading(id)

      await api.delete(`/notifications/${id}`)

      setNotifications((previous) =>
        previous.filter((item) => item._id !== id)
      )
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Could not delete notification.'
      )
    } finally {
      setActionLoading('')
    }
  }

  const unread = notifications.filter((item) => !item.isRead).length
  const read = notifications.length - unread

  const formatTime = (date) => {
    if (!date) return 'Date unavailable'

    return new Date(date).toLocaleString([], {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#123B35]">
            Notifications
          </h1>
          <p className="mt-1 text-gray-500">
            Stay updated on your community reports.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchNotifications}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-[#123B35] hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            onClick={markAllRead}
            disabled={unreadCount === 0 || actionLoading === 'all'}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#123B35] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#16A085] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck size={17} />
            {actionLoading === 'all' ? 'Updating...' : 'Mark all read'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
          <button
            onClick={() => setError('')}
            className="ml-3 font-semibold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <Bell className="text-[#16A085]" size={22} />
          <p className="mt-3 text-sm text-gray-500">
            Total notifications
          </p>
          <h2 className="mt-1 text-2xl font-bold text-[#123B35]">
            {notifications.length}
          </h2>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <AlertTriangle className="text-orange-500" size={22} />
          <p className="mt-3 text-sm text-gray-500">Unread</p>
          <h2 className="mt-1 text-2xl font-bold text-[#123B35]">
            {unread}
          </h2>
        </div>

        <div className="col-span-2 rounded-2xl bg-white p-5 shadow-sm sm:col-span-1">
          <CheckCircle className="text-green-600" size={22} />
          <p className="mt-3 text-sm text-gray-500">Read</p>
          <h2 className="mt-1 text-2xl font-bold text-[#123B35]">
            {read}
          </h2>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-bold text-[#123B35]">
          Recent Updates
        </h2>

        <div className="flex gap-2">
          {['All', 'Unread', 'Read'].map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                filter === item
                  ? 'bg-[#123B35] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        {loading ? (
          <div className="px-6 py-14 text-center">
            <RefreshCw
              size={30}
              className="mx-auto animate-spin text-[#16A085]"
            />
            <p className="mt-3 text-sm text-gray-500">
              Loading notifications...
            </p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <Bell size={40} className="mx-auto text-gray-300" />
            <h3 className="mt-4 font-bold text-[#123B35]">
              No notifications found
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              You have no notifications in this category.
            </p>
          </div>
        ) : (
          filteredNotifications.map((item) => {
            const style =
              notificationStyles[item.type] ||
              notificationStyles.General

            const Icon = style.icon

            return (
              <div
                key={item._id}
                className={`flex flex-col gap-4 border-b border-gray-100 p-5 transition last:border-b-0 sm:flex-row ${
                  !item.isRead ? 'bg-[#F0F9F6]' : 'bg-white'
                }`}
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${style.background}`}
                >
                  <Icon className={style.color} size={23} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-[#123B35]">
                      {item.title}
                    </h3>

                    {!item.isRead && (
                      <span className="h-2 w-2 rounded-full bg-[#16A085]" />
                    )}
                  </div>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {item.message}
                  </p>

                  <p className="mt-3 text-xs text-gray-400">
                    {formatTime(item.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {!item.isRead && (
                    <button
                      onClick={() => markRead(item._id)}
                      disabled={actionLoading === item._id}
                      className="rounded-lg px-3 py-2 text-xs font-semibold text-[#16A085] hover:bg-[#E5F4EF] disabled:opacity-50"
                    >
                      Mark read
                    </button>
                  )}

                  <button
                    onClick={() => deleteNotification(item._id)}
                    disabled={actionLoading === item._id}
                    title="Delete notification"
                    className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
