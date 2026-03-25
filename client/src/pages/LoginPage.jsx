import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await login(form);
      loginUser(res.data.token, res.data.user);
      const role = res.data.user.role;
      navigate(['officer','scientist','district_admin','state_admin','super_admin'].includes(role) ? '/admin' : '/dashboard');
    } catch (err) { setError(err.response?.data?.message || 'Login failed.'); }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-orb orb1" /><div className="auth-bg-orb orb2" />
      <div className="auth-card fade-up">
        <div className="auth-header">
          <div className="auth-logo">🌾</div>
          <div className="gov-auth-tag">Government of India</div>
          <h1>Farmer Login</h1>
          <p>RiceYield AI — Official Portal</p>
        </div>
        <div className="demo-hints">
          <div className="demo-row"><strong>Super Admin:</strong> admin@riceyield.ai / Admin@123</div>
          <div className="demo-row"><strong>Officer:</strong> officer@riceyield.ai / Officer@123</div>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group"><label>Email / Farmer ID</label><input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} required /></div>
          <div className="form-group"><label>Password</label><input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f=>({...f,password:e.target.value}))} required /></div>
          {error && <div className="error-msg">⚠️ {error}</div>}
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>{loading ? <span className="spinner"/> : '🔐 Sign In Securely'}</button>
        </form>
        <div className="auth-footer">New farmer? <Link to="/register">Register here</Link></div>
        <div className="auth-footer" style={{marginTop:'8px',fontSize:'0.75rem'}}>
          <a href="https://pmkisan.gov.in" target="_blank" rel="noreferrer" style={{color:'var(--text-muted)'}}>PM-KISAN Portal</a> · <a href="https://agri.rajasthan.gov.in" target="_blank" rel="noreferrer" style={{color:'var(--text-muted)'}}>Agriculture Dept.</a>
        </div>
      </div>
    </div>
  );
}
