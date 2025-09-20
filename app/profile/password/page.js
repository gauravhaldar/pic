'use client';

import { useState } from 'react';

export default function ProfilePassword() {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    currentTransactionPassword: '',
    newTransactionPassword: '',
    confirmTransactionPassword: ''
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Here you would typically validate and save the password data
    console.log('Saving password data:', passwordData);
    setIsEditing(false);
    // Reset form
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      currentTransactionPassword: '',
      newTransactionPassword: '',
      confirmTransactionPassword: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800/50 to-purple-800/50 backdrop-blur-sm border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Security</h1>
            <p className="text-gray-400">Update your Password Change</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Password Change Card */}
        <div className="bg-gradient-to-br from-slate-800/50 to-purple-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Password Settings</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-6 py-2 rounded-xl font-medium transition-all duration-300 ${
                isEditing
                  ? 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white'
                  : 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white'
              }`}
            >
              {isEditing ? 'Cancel' : 'Edit Passwords'}
            </button>
          </div>

          <div className="space-y-8">
            {/* Transaction Password Section */}
            <div className="bg-gradient-to-r from-slate-700/30 to-purple-700/30 rounded-xl p-6 border border-purple-500/20">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                🔐 Change Transaction Password
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Transaction Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Current Transaction Password:
                  </label>
                  {isEditing ? (
                    <input
                      type="password"
                      value={passwordData.currentTransactionPassword}
                      onChange={(e) => handleInputChange('currentTransactionPassword', e.target.value)}
                      placeholder="Enter current transaction password"
                      className="w-full bg-slate-700/50 text-white px-4 py-3 rounded-xl border border-purple-500/30 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 placeholder-gray-400"
                    />
                  ) : (
                    <div className="bg-slate-700/30 text-white px-4 py-3 rounded-xl border border-purple-500/20">
                      ••••••••
                    </div>
                  )}
                </div>

                {/* New Transaction Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    New Transaction Password:
                  </label>
                  {isEditing ? (
                    <input
                      type="password"
                      value={passwordData.newTransactionPassword}
                      onChange={(e) => handleInputChange('newTransactionPassword', e.target.value)}
                      placeholder="Enter new transaction password"
                      className="w-full bg-slate-700/50 text-white px-4 py-3 rounded-xl border border-purple-500/30 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 placeholder-gray-400"
                    />
                  ) : (
                    <div className="bg-slate-700/30 text-white px-4 py-3 rounded-xl border border-purple-500/20">
                      ••••••••
                    </div>
                  )}
                </div>

                {/* Confirm Transaction Password */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Transaction Password:
                  </label>
                  {isEditing ? (
                    <input
                      type="password"
                      value={passwordData.confirmTransactionPassword}
                      onChange={(e) => handleInputChange('confirmTransactionPassword', e.target.value)}
                      placeholder="Enter confirm transaction password"
                      className="w-full bg-slate-700/50 text-white px-4 py-3 rounded-xl border border-purple-500/30 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 placeholder-gray-400"
                    />
                  ) : (
                    <div className="bg-slate-700/30 text-white px-4 py-3 rounded-xl border border-purple-500/20">
                      ••••••••
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Regular Password Section */}
            <div className="bg-gradient-to-r from-slate-700/30 to-purple-700/30 rounded-xl p-6 border border-purple-500/20">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                🔑 Change Password
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Current Password:
                  </label>
                  {isEditing ? (
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                      placeholder="Enter current password"
                      className="w-full bg-slate-700/50 text-white px-4 py-3 rounded-xl border border-purple-500/30 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 placeholder-gray-400"
                    />
                  ) : (
                    <div className="bg-slate-700/30 text-white px-4 py-3 rounded-xl border border-purple-500/20">
                      ••••••••
                    </div>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    New Password:
                  </label>
                  {isEditing ? (
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => handleInputChange('newPassword', e.target.value)}
                      placeholder="Enter new password"
                      className="w-full bg-slate-700/50 text-white px-4 py-3 rounded-xl border border-purple-500/30 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 placeholder-gray-400"
                    />
                  ) : (
                    <div className="bg-slate-700/30 text-white px-4 py-3 rounded-xl border border-purple-500/20">
                      ••••••••
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password:
                  </label>
                  {isEditing ? (
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="Enter confirm password"
                      className="w-full bg-slate-700/50 text-white px-4 py-3 rounded-xl border border-purple-500/30 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 placeholder-gray-400"
                    />
                  ) : (
                    <div className="bg-slate-700/30 text-white px-4 py-3 rounded-xl border border-purple-500/20">
                      ••••••••
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Save Button */}
            {isEditing && (
              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
