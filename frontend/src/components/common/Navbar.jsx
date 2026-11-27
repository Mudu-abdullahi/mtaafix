
import { Link, NavLink, useLocation } from 'react-router-dom'
import { MapPin, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const handleHomeClick = () => {
    setMenuOpen(false)

    if (location.pathname === '/') {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      })
    }
  }

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Contact', path: '/contact' },
  ]

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        <Link
          to="/"
          onClick={handleHomeClick}
          className="flex items-center gap-2"
        >
          <div className="bg-[#123B35] text-white p-2 rounded-xl">
            <MapPin size={23} />
          </div>

          <span className="text-2xl font-bold text-[#123B35]">
            MtaaFix
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={link.path === '/' ? handleHomeClick : undefined}
              className={({ isActive }) =>
                `text-sm font-medium transition ${
                  isActive
                    ? 'text-[#16A085]'
                    : 'text-gray-600 hover:text-[#16A085]'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link to="/login" className="font-semibold text-[#123B35]">
            Login
          </Link>

          <Link
            to="/register"
            className="bg-[#123B35] text-white px-5 py-3 rounded-xl hover:bg-[#16A085] transition"
          >
            Get Started
          </Link>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-[#123B35]"
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? <X size={25} /> : <Menu size={25} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden px-6 pb-5 bg-white border-t border-gray-100">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => {
                setMenuOpen(false)

                if (link.path === '/') {
                  handleHomeClick()
                }
              }}
              className="block py-3 text-gray-600 hover:text-[#16A085]"
            >
              {link.name}
            </NavLink>
          ))}

          <Link
            to="/login"
            onClick={() => setMenuOpen(false)}
            className="block py-3 font-semibold text-[#123B35]"
          >
            Login
          </Link>

          <Link
            to="/register"
            onClick={() => setMenuOpen(false)}
            className="block text-center bg-[#123B35] text-white p-3 rounded-xl"
          >
            Get Started
          </Link>
        </div>
      )}
    </nav>
  )
}
