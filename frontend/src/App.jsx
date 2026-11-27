
import { Routes, Route, Link } from 'react-router-dom'

// Scroll restoration
import ScrollToTop from './components/common/ScrollToTop'

// Route protection
import ProtectedRoute from './components/common/ProtectedRoute'

// Layouts
import PublicLayout from './layouts/PublicLayout'
import CitizenLayout from './layouts/CitizenLayout'
import AdminLayout from './layouts/AdminLayout'
import TechnicianLayout from './layouts/TechnicianLayout'

// Public pages
import Home from './pages/public/Home'
import About from './pages/public/About'
import HowItWorks from './pages/public/HowItWorks'
import Contact from './pages/public/Contact'

// Authentication pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Citizen pages
import CitizenDashboard from './pages/citizen/CitizenDashboard'
import ReportProblem from './pages/citizen/ReportProblem'
import MyReports from './pages/citizen/MyReports'
import CommunityMap from './pages/citizen/CommunityMap'
import Notifications from './pages/citizen/Notifications'
import Profile from './pages/citizen/Profile'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AllReports from './pages/admin/AllReports'
import Assignments from './pages/admin/Assignments'
import Technicians from './pages/admin/Technicians'
import UsersPage from './pages/admin/Users'
import MapLocations from './pages/admin/MapLocations'
import Analytics from './pages/admin/Analytics'
import Settings from './pages/admin/Settings'

// Technician pages
import TechnicianDashboard from './pages/technician/TechnicianDashboard'
import TechnicianAssignments from './pages/technician/Assignments'
import TechnicianMap from './pages/technician/TechnicianMap'
import JobHistory from './pages/technician/JobHistory'
import TechnicianProfile from './pages/technician/TechnicianProfile'

// 404 Page
function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F7F5] px-6 text-center">
      <h1 className="text-7xl font-bold text-[#123B35]">
        404
      </h1>

      <h2 className="text-2xl font-bold text-[#123B35] mt-4">
        Page Not Found
      </h2>

      <p className="text-gray-500 mt-3">
        Sorry, the page you are looking for does not exist.
      </p>

      <Link
        to="/"
        className="mt-6 bg-[#123B35] text-white px-6 py-3 rounded-xl hover:bg-[#16A085] transition"
      >
        Return Home
      </Link>
    </div>
  )
}

// Main Application
export default function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>

        {/* Public Website */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Citizen Dashboard - Citizen Only */}
        <Route element={<ProtectedRoute allowedRoles={['citizen']} />}>
          <Route path="/citizen" element={<CitizenLayout />}>
            <Route path="dashboard" element={<CitizenDashboard />} />
            <Route path="report" element={<ReportProblem />} />
            <Route path="reports" element={<MyReports />} />
            <Route path="map" element={<CommunityMap />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Admin Dashboard - Admin Only */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="reports" element={<AllReports />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="technicians" element={<Technicians />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="map" element={<MapLocations />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Technician Portal - Technician Only */}
        <Route element={<ProtectedRoute allowedRoles={['technician']} />}>
          <Route path="/technician" element={<TechnicianLayout />}>
            <Route path="dashboard" element={<TechnicianDashboard />} />
            <Route path="assignments" element={<TechnicianAssignments />} />
            <Route path="map" element={<TechnicianMap />} />
            <Route path="history" element={<JobHistory />} />
            <Route path="profile" element={<TechnicianProfile />} />
          </Route>
        </Route>

        {/* Page Not Found */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </>
  )
}
