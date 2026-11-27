
import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'

import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Users,
  Wrench,
  MapPinned,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    path: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'All Reports',
    path: '/admin/reports',
    icon: FileText,
  },
  {
    name: 'Assignments',
    path: '/admin/assignments',
    icon: ClipboardList,
  },
  {
    name: 'Technicians',
    path: '/admin/technicians',
    icon: Wrench,
  },
  {
    name: 'Community Users',
    path: '/admin/users',
    icon: Users,
  },
  {
    name: 'Map Locations',
    path: '/admin/map',
    icon: MapPinned,
  },
  {
    name: 'Analytics',
    path: '/admin/analytics',
    icon: BarChart3,
  },
  {
    name: 'Settings',
    path: '/admin/settings',
    icon: Settings,
  },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigate = useNavigate()

  const handleLogout = () => {
    const confirmed = window.confirm(
      'Are you sure you want to log out?'
    )

    if (confirmed) {
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F7F5]">

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen w-72
          flex-col bg-[#123B35] text-white
          transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >

        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#16A085]">
              <MapPinned size={25} />
            </div>

            <div>
              <h1 className="text-xl font-bold">
                MtaaFix
              </h1>

              <p className="text-xs text-gray-300">
                Admin Portal
              </p>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X size={23} />
          </button>

        </div>

        {/* Admin Profile */}
        <div className="mx-4 mt-6 rounded-xl bg-white/10 p-4">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#16A085]">
              <ShieldCheck size={23} />
            </div>

            <div>
              <h3 className="font-semibold">
                System Admin
              </h3>

              <p className="text-xs text-gray-300">
                Administrator
              </p>
            </div>

          </div>

        </div>

        {/* Navigation */}
        <div className="mt-7 flex-1 overflow-y-auto px-4">

          <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Main Menu
          </p>

          <nav className="space-y-2">

            {navigation.map((item) => {
              const Icon = item.icon

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `
                    flex items-center justify-between rounded-xl px-4 py-3
                    transition-all duration-200
                    ${
                      isActive
                        ? 'bg-[#16A085] text-white shadow-lg'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >

                  <div className="flex items-center gap-3">

                    <Icon size={20} />

                    <span className="text-sm font-medium">
                      {item.name}
                    </span>

                  </div>

                  <ChevronRight size={16} />

                </NavLink>
              )
            })}

          </nav>

        </div>

        {/* Logout */}
        <div className="border-t border-white/10 p-4">

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-gray-300 transition hover:bg-red-500/20 hover:text-white"
          >
            <LogOut size={20} />

            <span className="text-sm font-medium">
              Logout
            </span>
          </button>

          <p className="mt-4 text-center text-xs text-gray-400">
            MtaaFix © 2026
          </p>

        </div>

      </aside>

      {/* Main Content */}
      <div className="min-h-screen lg:ml-72">

        {/* Header */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-8">

          <div className="flex items-center gap-4">

            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
            >
              <Menu size={24} />
            </button>

            <div>
              <h2 className="text-lg font-bold text-[#123B35]">
                Administration
              </h2>

              <p className="hidden text-xs text-gray-500 sm:block">
                Manage community reports and services
              </p>
            </div>

          </div>

          <div className="flex items-center gap-3">

            <button
              className="relative rounded-full p-3 text-gray-600 transition hover:bg-gray-100"
              aria-label="Notifications"
            >
              <Bell size={21} />

              <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-red-500" />
            </button>

            <div className="hidden h-9 w-px bg-gray-200 sm:block" />

            <div className="flex items-center gap-2">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#123B35] font-bold text-white">
                A
              </div>

              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-[#123B35]">
                  Administrator
                </p>

                <p className="text-xs text-gray-500">
                  System Manager
                </p>
              </div>

            </div>

          </div>

        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">

          <Outlet />

        </main>

      </div>

    </div>
  )
}
