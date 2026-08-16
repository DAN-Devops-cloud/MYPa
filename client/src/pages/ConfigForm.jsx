import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, RefreshCw } from 'lucide-react';

export default function ConfigForm() {
  const [formData, setFormData] = useState({
    name: '',
    protocol: 'vless',
    host: '',
    port: 443,
    transport: 'ws',
    tls: true,
    uuid: '',
    password: '',
    path: '/v2ray',
    sni: ''
  });

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (id) {
      fetchConfig();
    }
  }, [id]);

  const fetchConfig = async () => {
    setFetchLoading(true);
    try {
      const response = await axios.get(`/api/configs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData(response.data);
    } catch (err) {
      alert('❌ خطا در بارگیری کانفیگ');
      navigate('/');
    } finally {
      setFetchLoading(false);
    }
  };

  const generateUUID = () => {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    setFormData(prev => ({ ...prev, uuid }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!formData.name || !formData.host || !formData.port) {
      alert('❌ لطفاً تمام فیلدهای ضروری را پر کنید');
      setLoading(false);
      return;
    }

    if (formData.protocol !== 'trojan' && !formData.uuid) {
      alert('❌ UUID ضروری است');
      setLoading(false);
      return;
    }

    if (formData.protocol === 'trojan' && !formData.password) {
      alert('❌ رمز برای Trojan ضروری است');
      setLoading(false);
      return;
    }

    try {
      if (id) {
        await axios.put(`/api/configs/${id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('✅ کانفیگ با موفقیت بروزرسانی شد');
      } else {
        await axios.post('/api/configs', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('✅ کانفیگ با موفقیت ایجاد شد');
      }
      navigate('/');
    } catch (err) {
      alert('❌ ' + (err.response?.data?.error || 'خطا'));
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">⏳</div>
          <p className="text-gray-400">درحال بارگیری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark p-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-primary mb-6 hover:text-blue-400 font-bold"
        >
          <ArrowRight size={20} />
          بازگشت
        </button>

        <div className="card border-2 border-gray-800">
          <h1 className="text-3xl font-bold mb-8 text-white">
            {id ? '✏️ ویرایش کانفیگ' : '➕ کانفیگ جدید'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm mb-2 font-bold">📝 نام کانفیگ</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="مثال: Server 1"
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 font-bold">🔌 پروتکل</label>
                <select name="protocol" value={formData.protocol} onChange={handleChange} className="w-full">
                  <option value="vmess">VMess</option>
                  <option value="vless">VLESS</option>
                  <option value="trojan">Trojan</option>
                </select>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm mb-2 font-bold">🌐 آدرس سرور</label>
                <input
                  type="text"
                  name="host"
                  value={formData.host}
                  onChange={handleChange}
                  placeholder="example.com یا IP"
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 font-bold">🔢 پورت</label>
                <input
                  type="number"
                  name="port"
                  value={formData.port}
                  onChange={handleChange}
                  min="1"
                  max="65535"
                  required
                  className="w-full"
                />
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm mb-2 font-bold">📡 Transport</label>
                <select name="transport" value={formData.transport} onChange={handleChange} className="w-full">
                  <option value="tcp">TCP</option>
                  <option value="ws">WebSocket</option>
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="tls"
                    checked={formData.tls}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <span className="font-bold">🔒 TLS فعال</span>
                </label>
              </div>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm mb-2 font-bold">📍 مسیر</label>
                <input
                  type="text"
                  name="path"
                  value={formData.path}
                  onChange={handleChange}
                  placeholder="/v2ray"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 font-bold">🔐 SNI</label>
                <input
                  type="text"
                  name="sni"
                  value={formData.sni}
                  onChange={handleChange}
                  placeholder="example.com"
                  className="w-full"
                />
              </div>
            </div>

            {/* Protocol Specific Fields */}
            {formData.protocol !== 'trojan' && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold">🔑 UUID</label>
                  <button
                    type="button"
                    onClick={generateUUID}
                    className="flex items-center gap-1 text-primary hover:text-blue-400 text-xs font-bold"
                  >
                    <RefreshCw size={14} />
                    تولید
                  </button>
                </div>
                <input
                  type="text"
                  name="uuid"
                  value={formData.uuid}
                  onChange={handleChange}
                  placeholder="خودکار تولید می‌شود"
                  className="w-full font-mono text-xs"
                />
              </div>
            )}

            {formData.protocol === 'trojan' && (
              <div>
                <label className="block text-sm mb-2 font-bold">🔐 رمز Trojan</label>
                <input
                  type="text"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="رمز قوی را انتخاب کنید"
                  required
                  className="w-full font-mono text-sm"
                />
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4 mt-8 pt-6 border-t border-gray-800">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-success font-bold py-3 text-lg"
              >
                {loading ? '⏳ درحال ذخیره...' : '✅ ذخیره و برگشت'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded"
              >
                ❌ انصراف
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
