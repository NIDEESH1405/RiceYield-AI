import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePassword } from '../utils/api';
import './ProfilePage.css';

const ROLE_LABELS = { farmer:'Farmer', officer:'District Officer', scientist:'Agronomist', district_admin:'District Admin', state_admin:'State Admin', super_admin:'Super Admin' };
const ROLE_COLORS = { farmer:'#4ade80', officer:'#60a5fa', scientist:'#c084fc', district_admin:'#f59e0b', state_admin:'#fb923c', super_admin:'#ef4444' };

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({ name: user?.name||'', phone: user?.phone||'', district: user?.district||'', state: user?.state||'', village: user?.village||'', totalLandHolding: user?.totalLandHolding||'' });
  const [pwForm, setPwForm] = useState({ currentPassword:'', newPassword:'', confirm:'' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handleProfile = async (e) => {
    e.preventDefault(); setMsg(''); setErr(''); setLoading(true);
    try {
      const res = await updateProfile(form);
      setUser(res.data.user);
      setMsg('Profile updated successfully!');
    } catch(er) { setErr(er.response?.data?.message || 'Update failed'); }
    setLoading(false);
  };

  const handlePassword = async (e) => {
    e.preventDefault(); setMsg(''); setErr('');
    if (pwForm.newPassword !== pwForm.confirm) return setErr('Passwords do not match');
    if (pwForm.newPassword.length < 6) return setErr('Min 6 characters');
    setLoading(true);
    try {
      await changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setMsg('Password changed successfully!');
      setPwForm({ currentPassword:'', newPassword:'', confirm:'' });
    } catch(er) { setErr(er.response?.data?.message || 'Change failed'); }
    setLoading(false);
  };

  return (
    <div className="profile-page">
      <div className="profile-bg-orb" />
      <div className="profile-container">
        <div className="profile-hero card fade-up">
          <div className="profile-avatar" style={{background:`linear-gradient(135deg, ${ROLE_COLORS[user?.role]||'#4ade80'}, #16a34a)`}}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h1>{user?.name}</h1>
            <div className="profile-role" style={{color: ROLE_COLORS[user?.role]}}>{ROLE_LABELS[user?.role]}</div>
            <div className="profile-meta-row">
              {user?.farmerId && <span className="meta-chip">🪪 {user.farmerId}</span>}
              {user?.district && <span className="meta-chip">📍 {user.district}</span>}
              {user?.state && <span className="meta-chip">🗺️ {user.state}</span>}
              <span className={`meta-chip kyc-${user?.kycStatus}`}>🔐 KYC: {user?.kycStatus?.toUpperCase()}</span>
              {user?.isVerified && <span className="meta-chip verified">✅ Verified</span>}
            </div>
          </div>
          <div className="profile-stats-mini">
            <div className="pstat"><div className="pstat-val">{user?.estimationCount || 0}</div><div className="pstat-label">Estimations</div></div>
            <div className="pstat"><div className="pstat-val">{user?.totalLandHolding || 0} ha</div><div className="pstat-label">Land Holding</div></div>
            <div className="pstat"><div className="pstat-val">{user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : '—'}</div><div className="pstat-label">Last Login</div></div>
          </div>
        </div>

        <div className="profile-tabs fade-up">
          {['profile','security','notifications'].map(t => (
            <button key={t} className={`tab-btn ${tab===t?'active':''}`} onClick={() => setTab(t)}>
              {t==='profile'?'👤 Profile': t==='security'?'🔒 Security':'🔔 Notifications'}
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <div className="profile-form-card card fade-up">
            <h3>Personal Information</h3>
            <form onSubmit={handleProfile}>
              <div className="form-grid">
                <div className="form-group"><label>Full Name</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required/></div>
                <div className="form-group"><label>Phone Number</label><input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="+91 XXXXXXXXXX"/></div>
                <div className="form-group"><label>Village / Town</label><input value={form.village} onChange={e=>setForm(f=>({...f,village:e.target.value}))}/></div>
                <div className="form-group"><label>District</label><input value={form.district} onChange={e=>setForm(f=>({...f,district:e.target.value}))}/></div>
                <div className="form-group"><label>State</label><input value={form.state} onChange={e=>setForm(f=>({...f,state:e.target.value}))}/></div>
                <div className="form-group"><label>Total Land Holding (ha)</label><input type="number" value={form.totalLandHolding} onChange={e=>setForm(f=>({...f,totalLandHolding:e.target.value}))} min="0" step="0.01"/></div>
              </div>
              {msg && <div className="success-msg">✅ {msg}</div>}
              {err && <div className="error-msg">⚠️ {err}</div>}
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading?<span className="spinner"/>:'Save Changes'}</button>
            </form>
          </div>
        )}

        {tab === 'security' && (
          <div className="profile-form-card card fade-up">
            <h3>🔒 Change Password</h3>
            <form onSubmit={handlePassword}>
              <div className="form-group"><label>Current Password</label><input type="password" value={pwForm.currentPassword} onChange={e=>setPwForm(f=>({...f,currentPassword:e.target.value}))} required/></div>
              <div className="form-group"><label>New Password</label><input type="password" value={pwForm.newPassword} onChange={e=>setPwForm(f=>({...f,newPassword:e.target.value}))} required/></div>
              <div className="form-group"><label>Confirm New Password</label><input type="password" value={pwForm.confirm} onChange={e=>setPwForm(f=>({...f,confirm:e.target.value}))} required/></div>
              {msg && <div className="success-msg">✅ {msg}</div>}
              {err && <div className="error-msg">⚠️ {err}</div>}
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading?<span className="spinner"/>:'Change Password'}</button>
            </form>
            <div className="security-tips">
              <h4>🛡️ Security Tips</h4>
              <ul>
                <li>Use at least 8 characters with numbers and symbols</li>
                <li>Never share your password with anyone</li>
                <li>Change password every 90 days for government accounts</li>
                <li>Use different passwords for different accounts</li>
              </ul>
            </div>
          </div>
        )}

        {tab === 'notifications' && (
          <div className="profile-form-card card fade-up">
            <h3>🔔 Notifications</h3>
            {user?.notifications?.length === 0 || !user?.notifications ? (
              <div className="empty-notifs"><span>🔔</span><p>No notifications yet.</p></div>
            ) : (
              <div className="notif-list">
                {user.notifications.map((n,i) => (
                  <div key={i} className={`notif-row ${!n.read?'unread':''}`}>
                    <div className="notif-dot"/>
                    <div className="notif-content"><p>{n.message}</p><span>{new Date(n.createdAt).toLocaleDateString()}</span></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
