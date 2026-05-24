// Login.jsx - Animated Login Page
import React, { useState, Suspense } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, User, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { login } from '../api';

const ElectricOrb = React.lazy(() => import('../components/ElectricOrb'));

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(username, password);
      if (res.success) {
        loginUser(res.user);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, #020817 0%, #0a1628 50%, #020817 100%)',
      position: 'relative', overflow: 'hidden'
    }} className="bg-grid">

      <div style={{
        position: 'absolute', top: '20%', left: '30%', width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(0,128,255,0.08) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
      }} />

      {/* Left - 3D Orb */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          style={{ width: 400, height: 400 }}
        >
          <Suspense fallback={
            <div style={{ width: 400, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, #0080ff, #00f5ff)', opacity: 0.6 }} />
            </div>
          }>
            <ElectricOrb />
          </Suspense>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          style={{ textAlign: 'center', marginTop: 16 }}
        >
          <div className="neon-text font-orbitron" style={{ fontSize: 28, fontWeight: 900, letterSpacing: 4 }}>
            ⚡ ELECTRIC
          </div>
          <div style={{ fontFamily: 'Orbitron', fontSize: 14, color: '#64748b', letterSpacing: 6, marginTop: 4 }}>
            BILLING SYSTEM
          </div>
        </motion.div>
      </div>

      {/* Right - Login Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <motion.div
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          style={{ width: '100%', maxWidth: 420 }}
        >
          <div className="glass-card" style={{ padding: 40 }}>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', margin: '0 auto 16px',
                background: 'linear-gradient(135deg, #0080ff, #00f5ff)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 30px rgba(0,245,255,0.4)'
              }}>
                <Zap size={30} color="#000" />
              </div>
              <h1 className="font-orbitron" style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
                ADMIN LOGIN
              </h1>
              <p style={{ color: '#64748b', fontSize: 14 }}>Enter credentials to access panel</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'rgba(239,68,68,0.15)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 8, padding: '10px 14px', marginBottom: 20,
                  display: 'flex', alignItems: 'center', gap: 8, color: '#f87171', fontSize: 14
                }}
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, marginBottom: 6, letterSpacing: 1, fontFamily: 'Orbitron' }}>USERNAME</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="#00f5ff" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    className="input-field"
                    style={{ paddingLeft: 36 }}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: 28 }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, marginBottom: 6, letterSpacing: 1, fontFamily: 'Orbitron' }}>PASSWORD</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#00f5ff" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••"
                    className="input-field"
                    style={{ paddingLeft: 36 }}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: 13, letterSpacing: 2 }}
              >
                {loading ? '⟳  AUTHENTICATING...' : '⚡  LOGIN'}
              </button>
            </form>

            <div style={{ marginTop: 20, textAlign: 'center', padding: '12px', background: 'rgba(0,245,255,0.05)', borderRadius: 8, border: '1px solid rgba(0,245,255,0.1)' }}>
              <p style={{ color: '#64748b', fontSize: 12 }}>
                Default: <span style={{ color: '#00f5ff' }}>admin</span> / <span style={{ color: '#00f5ff' }}>1234</span>
              </p>
            </div>

            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <Link to="/customer/login" style={{
                color: '#4ade80', fontSize: 13, textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', background: 'rgba(34,197,94,0.08)',
                border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8
              }}>
                ⚡ Customer Portal Login →
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
