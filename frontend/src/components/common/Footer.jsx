
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-[#0D2C28] text-white py-10">
      <div className="max-w-7xl mx-auto px-6">

        <div className="grid md:grid-cols-3 gap-10">

          <div>
            <h2 className="text-2xl font-bold">MtaaFix</h2>
            <p className="text-gray-400 mt-3">
              Together, We Fix Our Communities.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">Quick Links</h3>

            <div className="flex flex-col gap-3 mt-4 text-gray-400 text-sm">
              <Link to="/">Home</Link>
              <Link to="/about">About</Link>
              <Link to="/how-it-works">How It Works</Link>
              <Link to="/contact">Contact</Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Our Mission</h3>
            <p className="text-gray-400 mt-4 text-sm leading-relaxed">
              Connecting citizens, administrators and technicians
              to create cleaner, safer and better communities.
            </p>
          </div>

        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} MtaaFix. All rights reserved.
        </div>

      </div>
    </footer>
  )
}
