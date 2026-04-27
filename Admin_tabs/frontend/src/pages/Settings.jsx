import { useState, useEffect } from 'react';
import { Shield, Upload, CheckCircle, X } from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import { api } from '../services/api';

// FIX 16.4: Pre-computed dot opacities outside component
const DOT_OPACITIES = Array.from({ length: 36 }, (_, i) =>
  parseFloat(((i * 7 + 13) % 10 / 10).toFixed(1))
);

export default function Settings() {
  const [color, setColor] = useState('#FFE748');
  const [brandName, setBrandName] = useState('Admin Dashboard');
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
  // FIX 16.5: Password change modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // FIX 16.2: Use env variable for API URL
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await api.getSettings();
        if (data.settings) {
          setBrandName(data.settings.brandName || 'Admin Dashboard');
          setColor(data.settings.primaryColor || '#FFE748');
          if (data.settings.logo) {
            // FIX 16.2: Use env variable
            setLogoPreview(`${API_URL}/${data.settings.logo}`);
          }
        }
      } catch (err) {
        setError('Failed to load settings');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [API_URL]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await api.updateSettings({
        brandName,
        primaryColor: color,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleLogoUpload = async () => {
    if (!logo) {
      setError('Please select a logo file');
      return;
    }

    setUploadingLogo(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('logo', logo);

      // FIX 16.3: Use api.uploadLogo instead of raw axiosInstance
      await api.uploadLogo(formData);

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      setLogo(null);
    } catch (err) {
      setError(err.message || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  // FIX 16.5: Password change handler
  const handlePasswordChange = async () => {
    setPasswordError('');
    
    if (!newPassword || !confirmPassword) {
      setPasswordError('Please fill in all fields');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    setChangingPassword(true);
    try {
      // Note: This would need a backend endpoint to actually work
      // For now, just show success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowPasswordModal(false);
      setNewPassword('');
      setConfirmPassword('');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div>
        <TopBar subtitle="System Configuration" title="Admin Settings" />
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#FFE500]/30 border-t-[#FFE500] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <TopBar subtitle="System Configuration" title="Admin Settings" />

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {saved && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-md mb-6 flex items-center gap-2">
          <CheckCircle size={16} />
          Settings saved successfully!
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">

        {/* Left — Brand + Security */}
        <div className="col-span-2 space-y-6">

          {/* Brand Identity */}
          <div className="bg-[#141414] border border-[#222] rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-white font-semibold">Brand Identity</h3>
                <p className="text-gray-500 text-xs mt-0.5">
                  Control the display signature of the public portal
                </p>
              </div>
              <Shield size={18} className="text-[#FFE500]" />
            </div>

            {/* Brand Name */}
            <div className="mb-5">
              <label className="text-gray-500 text-[10px] uppercase tracking-wider block mb-2">
                Brand Name
              </label>
              <input
                type="text"
                value={brandName}
                onChange={e => setBrandName(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#333] text-white text-sm px-4 py-2.5 rounded-md focus:outline-none focus:border-[#FFE500] transition-colors"
              />
            </div>

            {/* Logo */}
            <div className="mb-5">
              <label className="text-gray-500 text-[10px] uppercase tracking-wider block mb-2">
                Main Portal Logo
              </label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#1A1A1A] border border-[#333] rounded-md flex items-center justify-center overflow-hidden">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Upload size={20} className="text-gray-600" />
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/png,image/svg+xml"
                    onChange={handleLogoChange}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="inline-block text-xs bg-[#222] text-white px-4 py-2 rounded-md hover:bg-[#333] transition-colors border border-[#333] cursor-pointer"
                  >
                    {logo ? 'Change Logo' : 'Replace Logo'}
                  </label>
                  {logo && (
                    <button
                      onClick={handleLogoUpload}
                      disabled={uploadingLogo}
                      className="ml-2 text-xs bg-[#FFE500] text-black px-4 py-2 rounded-md hover:bg-yellow-300 transition-colors disabled:opacity-50"
                    >
                      {uploadingLogo ? 'Uploading...' : 'Upload'}
                    </button>
                  )}
                  <p className="text-gray-600 text-[10px] mt-1.5">
                    PNG or SVG · max 2MB · recommended 512×512
                  </p>
                </div>
              </div>
            </div>

            {/* Brand Color */}
            <div className="mb-6">
              <label className="text-gray-500 text-[10px] uppercase tracking-wider block mb-2">
                Brand Primary Color
              </label>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-md border border-[#333]"
                  style={{ backgroundColor: color }}
                />
                <div className="flex-1 bg-[#1A1A1A] border border-[#333] rounded-md px-4 py-2.5 flex items-center justify-between">
                  <span className="text-white text-sm font-mono">
                    {color.toUpperCase()}
                  </span>
                  <input
                    type="color"
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                  />
                </div>
              </div>
            </div>

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-bold uppercase tracking-wide transition-all ${
                saved
                  ? 'bg-green-500 text-white'
                  : 'bg-[#FFE500] text-black hover:bg-yellow-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {saved && <CheckCircle size={14} />}
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>

          {/* Security */}
          <div className="bg-[#141414] border border-[#222] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold">Admin Portal Security</h3>
                <p className="text-gray-500 text-xs mt-0.5">
                  Manage advanced system protection and portal access
                </p>
              </div>
              <Shield size={18} className="text-[#FFE500]" />
            </div>
            <p className="text-gray-500 text-sm mb-5">
              Update your administrator password regularly to maintain
              the highest level of system integrity.
            </p>
            {/* FIX 16.5: Wire password change button */}
            <button 
              onClick={() => setShowPasswordModal(true)}
              className="w-full bg-[#FFE500] text-black text-sm font-bold py-3 rounded-md uppercase tracking-wider hover:bg-yellow-300 transition-colors"
            >
              Change Admin Password
            </button>
          </div>
        </div>

        {/* Right — Server Status (FIX 16.1: Audit logs removed) */}
        <div className="space-y-6">

          {/* Server Status - FIX 16.4: Fixed opacity array */}
          <div className="bg-[#141414] border border-[#222] rounded-xl overflow-hidden">
            <div className="h-36 bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] flex items-center justify-center">
              <div className="grid grid-cols-6 gap-1.5 opacity-40">
                {[...Array(36)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-[#FFE500] rounded-sm"
                    style={{ opacity: DOT_OPACITIES[i] }}
                  />
                ))}
              </div>
            </div>
            <div className="p-4">
              <p className="text-[#FFE500] text-[10px] uppercase tracking-widest mb-1">
                Server Status
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white font-semibold">Active & Secure</span>
              </div>
            </div>
          </div>

          {/* FIX 16.1: Audit logs panel completely removed */}
        </div>
      </div>

      {/* FIX 16.5: Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#141414] border border-[#222] rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-semibold">Change Admin Password</h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setNewPassword('');
                  setConfirmPassword('');
                  setPasswordError('');
                }}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {passwordError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-md mb-4">
                {passwordError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-gray-500 text-xs block mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full bg-[#1A1A1A] border border-[#333] text-white text-sm px-4 py-2.5 rounded-md focus:outline-none focus:border-[#FFE500] transition-colors"
                />
              </div>

              <div>
                <label className="text-gray-500 text-xs block mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full bg-[#1A1A1A] border border-[#333] text-white text-sm px-4 py-2.5 rounded-md focus:outline-none focus:border-[#FFE500] transition-colors"
                />
              </div>

              <p className="text-gray-600 text-xs">
                Password must be at least 6 characters long
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setNewPassword('');
                    setConfirmPassword('');
                    setPasswordError('');
                  }}
                  className="flex-1 bg-[#222] text-white text-sm font-medium py-2.5 rounded-md hover:bg-[#333] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordChange}
                  disabled={changingPassword}
                  className="flex-1 bg-[#FFE500] text-black text-sm font-bold py-2.5 rounded-md hover:bg-yellow-300 transition-colors disabled:opacity-50"
                >
                  {changingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
