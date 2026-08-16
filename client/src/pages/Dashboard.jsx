import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Edit2, Trash2, Copy, QrCode, LogOut, Server } from 'lucide-react';
import ConfigModal from '../components/ConfigModal';

export default function Dashboard() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchConfigs();
    const interval = setInterval(fetchConfigs, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchConfigs = async () => {
    try {
      const response = await axios.get('/api/configs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConfigs(response.data);
    } catch (err) {
      console.error('خطا در بارگیری کانفیگ‌ها:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('آیا مطمئنید؟ این عمل قابل بازگشت نیست')) {
      try {
        await axios.delete(`/api/configs/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setConfigs(configs.filter(c => c.id !== id));
      } catch (err) {
        alert('❌ خطا در حذف کانفیگ');
      }
    }
  };

  const handleGenerateConfig = async (id) => {
    try {
      const response = await axios.post(`/api/configs/${id}/generate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedConfig(response.data);
      setShowModal(true);
    } catch (err) {
      alert('❌ خطا در تولید کانفیگ');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-dark p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              🚀 پنل V2Ray
            </h1>
            <p className="text-gray-400">خوش‌آمدید، {user.username}!</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded font-bold"
          >
            <LogOut size={20} />
            خروج
          </button>
        </div>

        {/* Create Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/create')}
            className="flex items-center gap-2 btn-success font-bold py-3 px-6 text-lg"
          >
            <Plus size={24} />
            ایجاد کانفیگ جدید
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">تعداد کانفیگ‌ها</p>
                <p className="text-3xl font-bold text-white">{configs.length}</p>
              </div>
              <Server className="text-primary" size={32} />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">کاربر فعال</p>
                <p className="text-3xl font-bold text-white">{user.username}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full"></div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">وضعیت</p>
                <p className="text-xl font-bold text-success">✅ آنلاین</p>
              </div>
              <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Configs Grid */}
        {loading ? (
          <div className="text-center text-gray-400 py-12">
            <div className="animate-spin mb-4">⏳</div>
            <p>درحال بارگیری...</p>
          </div>
        ) : configs.length === 0 ? (
          <div className="card text-center py-12">
            <Server size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-xl text-gray-400">هیچ کانفیگی وجود ندارد</p>
            <p className="text-gray-500 mt-2">برای شروع، یک کانفیگ جدید ایجاد کنید</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {configs.map((config) => (
              <div
                key={config.id}
                className="card hover:border-primary transition-all hover:shadow-lg hover:shadow-blue-500/20"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">{config.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {config.protocol.toUpperCase()} • {config.host}:{config.port}
                    </p>
                  </div>
                  <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full ml-2">
                    {config.transport.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-300 mb-4 border-t border-gray-800 pt-4">
                  <p>🔒 <span className="text-gray-400">TLS:</span> {config.tls ? '✅ فعال' : '❌ غیرفعال'}</p>
                  <p>📍 <span className="text-gray-400">مسیر:</span> {config.path}</p>
                  <p>🔐 <span className="text-gray-400">SNI:</span> {config.sni}</p>
                </div>

                <div className="flex gap-2 mt-6">
                  <button
                    onClick={() => handleGenerateConfig(config.id)}
                    title="تولید و اشتراک‌گذاری"
                    className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-blue-700 text-white py-2 rounded font-bold"
                  >
                    <QrCode size={18} />
                    تولید
                  </button>
                  <button
                    onClick={() => navigate(`/edit/${config.id}`, { state: config })}
                    title="ویرایش"
                    className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded font-bold"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(config.id)}
                    title="حذف"
                    className="flex items-center justify-center gap-2 bg-red-700 hover:bg-red-600 text-white py-2 px-4 rounded font-bold"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Config Modal */}
      {showModal && selectedConfig && (
        <ConfigModal
          config={selectedConfig}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
