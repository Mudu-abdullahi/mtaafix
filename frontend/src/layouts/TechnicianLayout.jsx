
import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  ClipboardList,
  MapPin,
  History,
  User,
  Bell,
  LogOut,
  Menu,
  X,
  Zap,
  ChevronRight,
  HardHat,
} from 'lucide-react'

export default function TechnicianLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const technician = JSON.parse(
    localStorage.getItem('mtaafixTechnicianProfile') || 'null'
  )

  const technicianName = technician?.name || 'Technician'
  const technicianInitial = technicianName.charAt(0).toUpperCase()

  const navigation = [
    {
      name: 'Dashboard',
      path: '/technician/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'My Assignments',
      path: '/technician/assignments',
      icon: ClipboardList,
    },
    {
      name: 'Job Locations',
      path: '/technician/map',
      icon: MapPin,
    },
    {
      name: 'Job History',
      path: '/technician/history',
      icon: History,
    },
    {
      name: 'My Profile',
      path: '/technician/profile',
      icon: User,
    },
  ]

  const handleLogout = () => {
    const confirmed = window.confirm(
      'Are you sure you want to log out?'
    )

    if (confirmed) {
      navigate('/login')
    }
  }

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="min-h-screen bg-[#F4F7F5] flex">

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-[#123B35] text-white flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >

        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#16A085] flex items-center justify-center">
              <Zap size={25} />
            </div>

            <div>
              <h1 className="text-xl font-bold">MtaaFix</h1>
              <p className="text-xs text-gray-300">
                Technician Portal
              </p>
            </div>
          </div>

          <button
            onClick={closeSidebar}
            className="lg:hidden text-gray-300 hover:text-white"
          >
            <X size={22} />
          </button>
        </div>

        {/* Technician Profile */}
        <div className="mx-4 mt-6 p-4 rounded-xl bg-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#16A085] flex items-center justify-center font-bold text-lg">
              {technicianInitial}
            </div>

            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">
                {technicianName}
              </p>
              <p className="text-xs text-gray-300">
                Field Technician
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 text-xs text-green-300">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            Technician Portal
          </div>
        </div>

        {/* Navigation */}
        <div className="px-4 mt-8 flex-1 overflow-y-auto">
          <p className="text-xs uppercase tracking-wider text-gray-400 px-3 mb-4">
            Workspace
          </p>

          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-4 py-3 rounded-xl text-sm transition ${
                      isActive
                        ? 'bg-[#16A085] text-white shadow-lg'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon size={19} />
                        <span>{item.name}</span>
                      </div>

                      {isActive && (
                        <ChevronRight size={17} />
                      )}
                    </>
                  )}
                </NavLink>
              )
            })}
          </nav>

          {/* Help Card */}
          <div className="mt-8 p-4 rounded-xl bg-white/10">
            <div className="flex items-center gap-2 mb-2">
              <HardHat size={19} className="text-[#16A085]" />
              <p className="text-sm font-semibold">
                Safety First
              </p>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Always follow safety procedures before starting
              any community repair work.
            </p>
          </div>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-red-500/20 hover:text-white transition text-sm"
          >
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">

        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu size={22} />
              </button>

              <div>
                <h2 className="font-semibold text-[#123B35]">
                  Technician Workspace
                </h2>
                <p className="text-xs text-gray-500">
                  Manage your assigned community jobs
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/technician/dashboard')}
                className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                aria-label="Notifications"
              >
                <Bell size={21} />
              </button>

              <div className="w-10 h-10 rounded-full bg-[#E8F5F1] text-[#16A085] flex items-center justify-center font-bold">
                {technicianInitial}
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
