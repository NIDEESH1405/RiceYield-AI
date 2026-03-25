import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../utils/api';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem('ry_token');
    if (token) { getMe().then(r => setUser(r.data.user)).catch(() => localStorage.removeItem('ry_token')).finally(() => setLoading(false)); }
    else setLoading(false);
  }, []);
  const loginUser = (token, userData) => { localStorage.setItem('ry_token', token); setUser(userData); };
  const logout = () => { localStorage.removeItem('ry_token'); setUser(null); };
  const isGovUser = user && ['officer','scientist','district_admin','state_admin','super_admin'].includes(user.role);
  return <AuthContext.Provider value={{ user, loading, loginUser, logout, setUser, isGovUser }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
