import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCurrency } from '../hooks/useCurrency';
import { Alert } from '../components/common/Alert';
import { userService } from '../services/api';
import { User, Shield, KeyRound, AlertTriangle, LogOut, CheckCircle2 } from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const { currency, changeCurrency } = useCurrency();

  const [name, setName] = useState(user?.name || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(null);
  const [profileError, setProfileError] = useState(null);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(null);
  const [pwError, setPwError] = useState(null);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);

    if (!name.trim()) {
      setProfileError('Name cannot be empty.');
      return;
    }

    setProfileLoading(true);
    try {
      const res = await userService.updateProfile({ name: name.trim(), preferredCurrency: currency });
      updateUser(res.data.user);
      setProfileSuccess('Profile details updated successfully.');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError('Please fill out all password fields.');
      return;
    }

    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }

    setPwLoading(true);
    try {
      await userService.updateProfile({
        currentPassword,
        newPassword
      });
      setPwSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* User Information Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <User size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {user?.name}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {user?.email}
            </p>
          </div>
        </div>

        <Alert type="success" message={profileSuccess} onClose={() => setProfileSuccess(null)} />
        <Alert type="error" message={profileError} onClose={() => setProfileError(null)} />

        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label htmlFor="user-name" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Full Name
            </label>
            <input
              id="user-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label htmlFor="user-email" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Email Address (Read-only)
            </label>
            <input
              id="user-email"
              type="email"
              disabled
              value={user?.email || ''}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-subtle)',
                color: 'var(--text-muted)',
                fontSize: '14px',
                cursor: 'not-allowed'
              }}
            />
          </div>

          {/* Currency Preference & Warning Notice */}
          <div>
            <label htmlFor="user-currency" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Display Currency Preference
            </label>
            <select
              id="user-currency"
              value={currency}
              onChange={(e) => changeCurrency(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                fontSize: '14px',
                backgroundColor: '#fff',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="INR">INR (₹) - Indian Rupee (Default)</option>
              <option value="USD">USD ($) - US Dollar</option>
              <option value="EUR">EUR (€) - Euro</option>
            </select>

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                padding: '10px 14px',
                backgroundColor: 'var(--accent-warning-bg)',
                border: '1px solid #fde68a',
                borderRadius: 'var(--radius-md)',
                marginTop: '10px',
                fontSize: '12px',
                color: 'var(--accent-warning-text)'
              }}
            >
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>
                <strong>Note:</strong> Changing display currency changes formatting only.
                Existing stored amounts are not automatically converted using live foreign exchange rates.
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={profileLoading}
            style={{
              alignSelf: 'flex-start',
              padding: '10px 20px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '13px',
              cursor: profileLoading ? 'not-allowed' : 'pointer',
              opacity: profileLoading ? 0.7 : 1
            }}
          >
            {profileLoading ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>

      {/* Security & Password Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <KeyRound size={20} style={{ color: 'var(--primary)' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Change Password
          </h3>
        </div>

        <Alert type="success" message={pwSuccess} onClose={() => setPwSuccess(null)} />
        <Alert type="error" message={pwError} onClose={() => setPwError(null)} />

        <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label htmlFor="curr-pw" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Current Password
            </label>
            <input
              id="curr-pw"
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label htmlFor="new-pw" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                New Password
              </label>
              <input
                id="new-pw"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label htmlFor="confirm-new-pw" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Confirm New Password
              </label>
              <input
                id="confirm-new-pw"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={pwLoading}
            style={{
              alignSelf: 'flex-start',
              padding: '10px 20px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: 'var(--text-primary)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '13px',
              cursor: pwLoading ? 'not-allowed' : 'pointer',
              opacity: pwLoading ? 0.7 : 1
            }}
          >
            {pwLoading ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* College Project Submission Information Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
          <CheckCircle2 size={18} />
          <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
            College Academic Submission
          </h4>
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <strong>Student Name:</strong> Swara Rode <br />
          <strong>PRN:</strong> 25070521141 <br />
          <strong>Project:</strong> CA-03 Full-Stack Web Development Project <br />
          <strong>Repository:</strong> 25070521141-CA-03
        </div>
      </div>

      {/* Logout Action */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
        <button
          type="button"
          onClick={logout}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #fecaca',
            backgroundColor: 'var(--accent-expense-bg)',
            color: 'var(--accent-expense-text)',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <LogOut size={16} />
          <span>Sign Out of Account</span>
        </button>
      </div>
    </div>
  );
};
