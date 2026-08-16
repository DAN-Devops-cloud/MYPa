import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogIn, Info } from 'lucide-react';

export default function Login({ setAuth }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/auth/login', { username, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setAuth(true);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'خطای ورود');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 rounded-lg shadow-2xl border border-gray-800 p-8">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
              <LogIn size={32} className="text-white" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-center mb-2 text-white">
            V2Ray Panel
          </h1>
          <p className="text-center text-gray-400 mb-8 text-sm">
            سیستم مدیریت کانفیگ V2Ray/Trojan
          </p>

          {error && (
            <div className="bg-red-900 text-red-100 p-3 rounded mb-4 text-center border border-red-700">
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm mb-2 font-medium">👤 نام‌کاربری</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="نام‌کاربری خود را وارد کنید"
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm mb-2 font-medium">🔐 رمز عبور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="رمز عبور خود را وارد کنید"
                required
                className="w-full"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-success font-bold py-3 text-lg"
            >
              {loading ? '⏳ درحال ورود...' : '✅ ورود'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-900 bg-opacity-30 border border-blue-700 rounded">
            <div className="flex gap-2">
              <Info size={18} className="text-blue-400 flex-shrink-0 mt-1" />
              <div className="text-xs text-blue-200">
                <p className="font-bold mb-2">🔑 برای تست:</p>
                <p><span className="font-mono">نام‌کاربری:</span> admin</p>
                <p><span className="font-mono">رمز:</span> admin</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
