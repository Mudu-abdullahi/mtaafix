
import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'

import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Map,
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react'

const navigation = [
  {
    name: 'Overview',
    path: '/citizen/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Report a Problem',
    path: '/citizen/report',
    icon: PlusCircle,
  },
  {
    name: 'My Reports',
    path: '/citizen/reports',
    icon: FileText,
  },
  {
    name: 'Community Map',
    path: '/citizen/map',
    icon: Map,
  },
  {
    name: 'Notifications',
    path: '/citizen/notifications',
    icon: Bell,
  },
  {
    name: 'My Profile',
    path: '/citizen/profile',
    icon: User,
  },
]

export default function CitizenLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const savedProfile = JSON.parse(
    localStorage.getItem('mtaafixProfile') || 'null'
  )

  const userName = savedProfile?.name || 'Community Member'
  const initial = userName.charAt(0).toUpperCase()

  const handleLogout = () => {
    const confirmLogout = window.confirm(
      'Are you sure you want to logout?'
    )

    if (confirmLogout) {
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F7F5] md:flex">

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#123B35] text-white transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >

        {/* Logo */}
        <div className="flex items-center justify-between border-b border-white/10 px-7 py-6">
          <Link to="/" className="text-2xl font-extrabold">
            Mtaa<span className="text-[#16A085]">Fix.</span>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 hover:bg-white/10 md:hidden"
          >
            <X size={22} />
          </button>
        </div>

        {/* User Information */}
        <div className="px-7 py-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-green-200">
            Citizen Portal
          </p>

          <div className="mt-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#16A085] font-bold">
              {initial}
            </div>

            <div className="min-w-0">
              <p className="truncate font-semibold">{userName}</p>
              <p className="text-xs text-green-200">
                Citizen Account
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-green-300">
            Main Menu
          </p>

          {navigation.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/citizen/dashboard'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'bg-[#16A085] text-white shadow-lg'
                      : 'text-green-100 hover:bg-white/10'
                  }`
                }
              >
                <Icon size={19} />
                {item.name}
              </NavLink>
            )
          })}
        </nav>

        {/* Sidebar Bottom */}
        <div className="space-y-2 border-t border-white/10 p-4">

          <button
            onClick={() => {
              setSidebarOpen(false)
              navigate('/citizen/profile')
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-green-100 hover:bg-white/10"
          >
            <Settings size={19} />
            Settings
          </button>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-red-200 hover:bg-white/10"
          >
            <LogOut size={19} />
            Logout
          </button>

        </div>
      </aside>

      {/* Main Content */}
      <div className="min-w-0 flex-1 md:ml-72">

        {/* Header */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-gray-100 bg-white px-5 md:px-10">

          <div className="flex items-center gap-3">

            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 hover:bg-gray-100 md:hidden"
            >
              <Menu size={23} />
            </button>

            <div>
              <p className="font-semibold text-[#123B35]">
                Citizen Dashboard
              </p>

              <p className="hidden text-xs text-gray-400 sm:block">
                Community management portal
              </p>
            </div>

          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-4">

            <button
              onClick={() => navigate('/citizen/notifications')}
              className="relative rounded-full p-2 text-gray-500 transition hover:bg-gray-100"
              title="Notifications"
            >
              <Bell size={21} />

              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
            </button>

            <button
              onClick={() => navigate('/citizen/profile')}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 font-bold text-[#123B35]"
              title="My Profile"
            >
              {initial}
            </button>

          </div>
        </header>

        {/* Page Content */}
        <main className="p-5 md:p-10">
          <Outlet />
        </main>

      </div>
    </div>
  )
}
