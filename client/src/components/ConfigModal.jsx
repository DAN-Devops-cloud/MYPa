import React, { useState } from 'react';
import QRCode from 'qrcode.react';
import { Copy, X, Check } from 'lucide-react';

export default function ConfigModal({ config, onClose }) {
  const [copiedField, setCopiedField] = useState(null);

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-lg border-2 border-primary p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">📤 اشتراک‌گذاری</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* QR Code */}
          <div className="bg-white p-4 rounded-lg flex justify-center">
            <QRCode
              value={config.configString}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>

          {/* Share Link */}
          <div>
            <label className="block text-sm mb-2 font-bold">🔗 لینک اشتراک‌گذاری</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={config.shareLink}
                readOnly
                className="flex-1 bg-gray-800 border border-gray-700 text-white text-xs p-2 rounded font-mono"
              />
              <button
                onClick={() => copyToClipboard(config.shareLink, 'link')}
                className={`px-3 py-2 rounded transition ${
                  copiedField === 'link'
                    ? 'bg-success text-white'
                    : 'bg-primary hover:bg-blue-700 text-white'
                }`}
              >
                {copiedField === 'link' ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
          </div>

          {/* Base64 */}
          <div>
            <label className="block text-sm mb-2 font-bold">📋 Base64</label>
            <div className="relative">
              <textarea
                value={config.base64Config}
                readOnly
                className="w-full h-20 bg-gray-800 border border-gray-700 text-white text-xs p-2 rounded font-mono"
              />
              <button
                onClick={() => copyToClipboard(config.base64Config, 'base64')}
                className={`absolute top-2 left-2 p-2 rounded transition ${
                  copiedField === 'base64'
                    ? 'bg-success text-white'
                    : 'bg-primary hover:bg-blue-700 text-white'
                }`}
              >
                {copiedField === 'base64' ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          {/* Config String */}
          <div>
            <label className="block text-sm mb-2 font-bold">🔐 Config String</label>
            <div className="relative">
              <textarea
                value={config.configString}
                readOnly
                className="w-full h-20 bg-gray-800 border border-gray-700 text-white text-xs p-2 rounded font-mono break-all"
              />
              <button
                onClick={() => copyToClipboard(config.configString, 'config')}
                className={`absolute top-2 left-2 p-2 rounded transition ${
                  copiedField === 'config'
                    ? 'bg-success text-white'
                    : 'bg-primary hover:bg-blue-700 text-white'
                }`}
              >
                {copiedField === 'config' ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-900 bg-opacity-30 border border-blue-700 rounded p-4">
            <p className="text-xs text-blue-200">
              💡 می‌توانید QR Code را با کلاینت خود اسکن کنید یا لینک را اشتراک‌گذاری کنید
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full btn-danger mt-6 font-bold"
        >
          ❌ بستن
        </button>
      </div>
    </div>
  );
}
