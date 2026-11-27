
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from 'lucide-react';
import api from '../../services/api';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const { token, user } = response.data;

      // Save authentication details.
      localStorage.setItem('mtaafix_token', token);
      localStorage.setItem('mtaafix_user', JSON.stringify(user));

      // Redirect according to the actual backend role.
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'technician') {
        navigate('/technician/dashboard');
      } else {
        navigate('/citizen/dashboard');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Login failed. Please check your details and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F7F5] px-5 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl md:grid-cols-2">

        <div className="hidden flex-col justify-between bg-[#123B35] p-12 text-white md:flex">
          <Link to="/" className="text-3xl font-extrabold">
            Mtaa<span className="text-[#16A085]">Fix.</span>
          </Link>

          <div>
            <h1 className="text-4xl font-bold leading-tight">
              Welcome back to a better community.
            </h1>

            <p className="mt-5 leading-7 text-green-100">
              Sign in to report problems, follow community improvements
              and help create safer neighbourhoods.
            </p>
          </div>

          <p className="text-sm text-green-200">
            Together, We Fix Our Communities.
          </p>
        </div>

        <div className="p-8 md:p-12">
          <Link to="/" className="font-bold text-[#123B35] md:hidden">
            Mtaa<span className="text-[#16A085]">Fix.</span>
          </Link>

          <h2 className="mt-8 text-3xl font-bold text-[#123B35] md:mt-2">
            Sign in
          </h2>

          <p className="mt-2 text-gray-500">
            Welcome back! Enter your account details.
          </p>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Email address
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3">
                <Mail size={19} className="text-gray-400" />

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Password
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3">
                <Lock size={19} className="text-gray-400" />

                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400"
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#123B35] py-4 font-semibold text-white transition hover:bg-[#19564C] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-[#16A085]">
              Create account
            </Link>
          </p>

          <Link to="/" className="mt-6 block text-center text-sm text-gray-400">
            ← Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
