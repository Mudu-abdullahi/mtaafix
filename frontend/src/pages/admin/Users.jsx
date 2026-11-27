
import { useEffect, useState, useCallback } from 'react'
import {
  Users,
  Search,
  UserRound,
  Mail,
  Phone,
  ShieldCheck,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react'
import api from '../../services/api'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [totalUsers, setTotalUsers] = useState(0)
  const [activeCount, setActiveCount] = useState(0)
  const [suspendedCount, setSuspendedCount] = useState(0)

  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const limit = 10

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchUsers = useCallback(async () => {
    try {
      setError('')
      setLoading(true)

      const params = {
        page,
        limit,
        search: search.trim()
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter
      }

      const [usersResponse, activeResponse, suspendedResponse] =
        await Promise.all([
          api.get('/admin/users', { params }),
          api.get('/admin/users', {
            params: { page: 1, limit: 1, status: 'active' }
          }),
          api.get('/admin/users', {
            params: { page: 1, limit: 1, status: 'suspended' }
          })
        ])

      const data = usersResponse.data

      setUsers(data.users || [])
      setTotalUsers(data.total || 0)
      setPages(data.pages || 1)

      setActiveCount(activeResponse.data.total || 0)
      setSuspendedCount(suspendedResponse.data.total || 0)
    } catch (err) {
      console.error('Failed to fetch community users:', err)

      setError(
        err.response?.data?.message ||
        'Unable to load community users. Please try again.'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchUsers()
  }

  const toggleStatus = async (user) => {
    const currentStatus = String(user.status || '').toLowerCase()
    const newStatus =
      currentStatus === 'active' ? 'suspended' : 'active'

    const action = newStatus === 'suspended' ? 'suspend' : 'activate'

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${user.name}'s account?`
    )

    if (!confirmed) return

    try {
      setUpdatingId(user._id)
      setError('')
      setSuccess('')

      await api.patch(`/admin/users/${user._id}/status`, {
        status: newStatus
      })

      setSuccess(
        `${user.name}'s account has been ${newStatus} successfully.`
      )

      await fetchUsers()
    } catch (err) {
      console.error('Failed to update user status:', err)

      setError(
        err.response?.data?.message ||
        'Unable to update this account. Please try again.'
      )
    } finally {
      setUpdatingId(null)
    }
  }

  const handleSearch = (value) => {
    setSearch(value)
    setPage(1)
  }

  const handleStatusFilter = (value) => {
    setStatusFilter(value)
    setPage(1)
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'

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
            Community Users
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage registered citizens and their account status.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading || refreshing}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#123B35] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#19564D] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={18}
            className={refreshing ? 'animate-spin' : ''}
          />
          Refresh Users
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Users"
          value={totalUsers}
          icon={Users}
        />

        <StatCard
          title="Active Users"
          value={activeCount}
          icon={ShieldCheck}
        />

        <StatCard
          title="Suspended Users"
          value={suspendedCount}
          icon={UserRound}
        />
      </div>

      {/* Success Message */}
      {success && (
        <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <span>{success}</span>

          <button
            onClick={() => setSuccess('')}
            className="font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search users by name, email or phone..."
            className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-[#16A085]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#16A085]"
        >
          <option value="all">All Users</option>
          <option value="active">Active Users</option>
          <option value="suspended">Suspended Users</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
        <div className="border-b border-gray-100 p-5">
          <h2 className="font-semibold text-[#123B35]">
            Registered Community Members
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Showing {users.length} of {totalUsers} users
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-5 py-4">User</th>
                <th className="px-5 py-4">Contact</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Date Joined</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <RefreshCw
                        size={18}
                        className="animate-spin"
                      />
                      Loading community users...
                    </div>
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user) => {
                  const isActive =
                    String(user.status).toLowerCase() === 'active'

                  return (
                    <tr
                      key={user._id}
                      className="transition hover:bg-gray-50"
                    >
                      {/* User */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F5F1] font-bold text-[#16A085]">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </div>

                          <div>
                            <p className="font-semibold text-[#123B35]">
                              {user.name}
                            </p>

                            <p className="text-xs text-gray-400">
                              {user._id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-4">
                        <p className="flex items-center gap-2 text-gray-600">
                          <Mail size={14} />
                          {user.email}
                        </p>

                        <p className="mt-2 flex items-center gap-2 text-gray-500">
                          <Phone size={14} />
                          {user.phone || 'Not provided'}
                        </p>
                      </td>

                      {/* Role */}
                      <td className="px-5 py-4 text-gray-600">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-700">
                          {user.role || 'citizen'}
                        </span>
                      </td>

                      {/* Date Joined */}
                      <td className="px-5 py-4 text-gray-600">
                        {formatDate(user.createdAt)}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4">
                        <button
                          onClick={() => toggleStatus(user)}
                          disabled={updatingId === user._id}
                          className={`rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            isActive
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-green-50 text-green-700 hover:bg-green-100'
                          }`}
                        >
                          {updatingId === user._id
                            ? 'Updating...'
                            : isActive
                              ? 'Suspend'
                              : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    <Users
                      size={35}
                      className="mx-auto mb-3 text-gray-300"
                    />

                    <p className="font-semibold">
                      No users found.
                    </p>

                    <p className="mt-1 text-xs">
                      Try changing your search or filter.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalUsers > 0 && (
          <div className="flex flex-col justify-between gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center">
            <p className="text-sm text-gray-500">
              Page {page} of {pages}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((current) => current - 1)}
                disabled={page <= 1}
                className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <button
                onClick={() => setPage((current) => current + 1)}
                disabled={page >= pages}
                className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400">
        Community users are loaded directly from the MtaaFix database.
      </p>
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
