import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

const INDIAN_STATES = ['Andhra Pradesh','Assam','Bihar','Chhattisgarh','Gujarat','Haryana','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Odisha','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','Uttarakhand','West Bengal'];

export default function RegisterPage() {
  const [form, setForm] = useState({ name:'', email:'', password:'', confirm:'', phone:'', state:'', district:'', village:'', totalLandHolding:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      const res = await register({ name:form.name, email:form.email, password:form.password, phone:form.phone, state:form.state, district:form.district, village:form.village, totalLandHolding:parseFloat(form.totalLandHolding)||0 });
      loginUser(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) { setError(err.response?.data?.message || 'Registration failed.'); }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-orb orb1" /><div className="auth-bg-orb orb2" />
      <div className="auth-card auth-card-wide fade-up">
        <div className="auth-header">
          <div className="auth-logo">🌾</div>
          <div className="gov-auth-tag">Government of India</div>
          <h1>Farmer Registration</h1>
          <p>Register to access government schemes & AI yield tools</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="reg-grid">
            <div className="form-group"><label>Full Name *</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required placeholder="As per Aadhaar"/></div>
            <div className="form-group"><label>Mobile Number *</label><input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="+91 XXXXXXXXXX"/></div>
            <div className="form-group"><label>Email Address *</label><input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} required/></div>
            <div className="form-group"><label>State *</label>
              <select value={form.state} onChange={e=>setForm(f=>({...f,state:e.target.value}))}>
                <option value="">Select State</option>
                {INDIAN_STATES.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group"><label>District *</label><input value={form.district} onChange={e=>setForm(f=>({...f,district:e.target.value}))} placeholder="Your district"/></div>
            <div className="form-group"><label>Village / Town</label><input value={form.village} onChange={e=>setForm(f=>({...f,village:e.target.value}))}/></div>
            <div className="form-group"><label>Total Land (hectares)</label><input type="number" value={form.totalLandHolding} onChange={e=>setForm(f=>({...f,totalLandHolding:e.target.value}))} min="0" step="0.01" placeholder="0.00"/></div>
            <div className="form-group"><label>Password *</label><input type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} required placeholder="Min 6 characters"/></div>
            <div className="form-group"><label>Confirm Password *</label><input type="password" value={form.confirm} onChange={e=>setForm(f=>({...f,confirm:e.target.value}))} required/></div>
          </div>
          {error && <div className="error-msg">⚠️ {error}</div>}
          <div className="auth-consent">By registering, you agree that your farm data may be used for government agricultural planning purposes.</div>
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>{loading?<span className="spinner"/>:'🌾 Register as Farmer'}</button>
        </form>
        <div className="auth-footer">Already registered? <Link to="/login">Sign in</Link></div>
      </div>
    </div>
  );
}
