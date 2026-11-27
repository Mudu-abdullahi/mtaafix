
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, MapPin } from 'lucide-react';
import api from '../../services/api';

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    password: '',
    confirmPassword: '',
    role: 'citizen',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (form.password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/register', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
      });

      const { token, user } = response.data;

      // Save the authenticated user's details.
      localStorage.setItem('mtaafix_token', token);
      localStorage.setItem('mtaafix_user', JSON.stringify(user));

      // Registration creates citizen accounts.
      navigate('/citizen/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F7F5] px-5 py-10">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-xl md:p-12">

        <Link to="/" className="text-2xl font-extrabold text-[#123B35]">
          Mtaa<span className="text-[#16A085]">Fix.</span>
        </Link>

        <h1 className="mt-8 text-3xl font-bold text-[#123B35]">
          Create your account
        </h1>

        <p className="mt-2 text-gray-500">
          Join your community and help make a difference.
        </p>

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="mt-8 grid gap-5 md:grid-cols-2">

          <div>
            <label className="mb-2 block text-sm font-semibold">Full name</label>
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3">
              <User size={18} className="text-gray-400" />
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Your full name"
                className="w-full outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">Email address</label>
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3">
              <Mail size={18} className="text-gray-400" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">Phone number</label>
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3">
              <Phone size={18} className="text-gray-400" />
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                required
                placeholder="07XXXXXXXX"
                className="w-full outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">Neighbourhood</label>
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3">
              <MapPin size={18} className="text-gray-400" />
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                required
                placeholder="e.g. Westlands"
                className="w-full outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">Password</label>
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3">
              <Lock size={18} className="text-gray-400" />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={8}
                placeholder="Minimum 8 characters"
                className="w-full outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">Confirm password</label>
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3">
              <Lock size={18} className="text-gray-400" />
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Repeat password"
                className="w-full outline-none"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold">Account type</label>
            <select
              name="role"
              value="citizen"
              disabled
              className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 outline-none"
            >
              <option value="citizen">Citizen</option>
            </select>

            <p className="mt-2 text-xs text-gray-400">
              Administrator and technician accounts will be created by the system administrator.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-[#123B35] py-4 font-semibold text-white transition hover:bg-[#19564C] disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-[#16A085]">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
