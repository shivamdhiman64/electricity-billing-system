// CustomerLogin.jsx - Customer Portal Login Page
import React, { useState, Suspense } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Hash, Phone, AlertCircle, ShieldCheck } from 'lucide-react';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { customerLogin } from '../api';

const ElectricOrb = React.lazy(() => import('../components/ElectricOrb'));

export default function CustomerLogin() {
  const [meter_no, setMeterNo] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginCustomer } = useCustomerAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await customerLogin(meter_no, phone);
      if (res.success) {
        loginCustomer(res.customer);
        navigate('/customer/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid meter number or phone');
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

      {/* Glow */}
      <div style={{
        position: 'absolute', top: '20%', left: '30%', width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
      }} />

      {/* Left - 3D Orb */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }}
          style={{ width: 380, height: 380 }}>
          <Suspense fallback={
            <div style={{ width: 380, height: 380, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, #22c55e, #00f5ff)', opacity: 0.5 }} />
            </div>
          }>
            <ElectricOrb />
          </Suspense>
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
          style={{ textAlign: 'center', marginTop: 16 }}>
          <div style={{ fontFamily: 'Orbitron', fontSize: 26, fontWeight: 900, color: '#4ade80', textShadow: '0 0 20px #22c55e', letterSpacing: 3 }}>
            ⚡ CUSTOMER
          </div>
          <div style={{ fontFamily: 'Orbitron', fontSize: 13, color: '#64748b', letterSpacing: 5, marginTop: 4 }}>
            SELF-SERVICE PORTAL
          </div>
        </motion.div>
      </div>

      {/* Right - Login Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <motion.div initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }}
          style={{ width: '100%', maxWidth: 420 }}>

          <div className="glass-card" style={{ padding: 40 }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', margin: '0 auto 16px',
                background: 'linear-gradient(135deg, #16a34a, #4ade80)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 30px rgba(34,197,94,0.4)'
              }}>
                <ShieldCheck size={30} color="#000" />
              </div>
              <h1 className="font-orbitron" style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
                CUSTOMER LOGIN
              </h1>
              <p style={{ color: '#64748b', fontSize: 14 }}>Enter your meter number & phone</p>
            </div>

            {/* Error */}
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 8, padding: '10px 14px', marginBottom: 20,
                  display: 'flex', alignItems: 'center', gap: 8, color: '#f87171', fontSize: 14
                }}>
                <AlertCircle size={16} /> {error}
              </motion.div>
            )}

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: 11, marginBottom: 6, letterSpacing: 1, fontFamily: 'Orbitron' }}>
                  METER NUMBER
                </label>
                <div style={{ position: 'relative' }}>
                  <Hash size={16} color="#4ade80" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="text" value={meter_no} onChange={e => setMeterNo(e.target.value)}
                    placeholder="e.g. MTR001" className="input-field" style={{ paddingLeft: 36 }} required />
                </div>
              </div>

              <div style={{ marginBottom: 28 }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: 11, marginBottom: 6, letterSpacing: 1, fontFamily: 'Orbitron' }}>
                  PHONE NUMBER
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} color="#4ade80" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="text" value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210" className="input-field" style={{ paddingLeft: 36 }} required />
                </div>
              </div>

              <button type="submit" disabled={loading}
                style={{
                  width: '100%', padding: '14px', fontSize: 13, letterSpacing: 2,
                  background: 'linear-gradient(135deg, #16a34a, #4ade80)',
                  color: '#000', fontWeight: 700, borderRadius: 8, border: 'none',
                  cursor: 'pointer', fontFamily: 'Orbitron',
                  boxShadow: loading ? 'none' : '0 0 20px rgba(34,197,94,0.3)',
                  transition: 'all 0.3s'
                }}>
                {loading ? '⟳  VERIFYING...' : '⚡  LOGIN'}
              </button>
            </form>

            {/* Sample hint */}
            <div style={{ marginTop: 20, padding: 12, background: 'rgba(34,197,94,0.05)', borderRadius: 8, border: '1px solid rgba(34,197,94,0.15)' }}>
              <p style={{ color: '#64748b', fontSize: 12, marginBottom: 4 }}>Sample credentials:</p>
              <p style={{ color: '#4ade80', fontSize: 12 }}>Meter: MTR001 | Phone: 9876543210</p>
            </div>

            {/* Admin link */}
            <div style={{ marginTop: 20, textAlign: 'center' }}>
              <Link to="/login" style={{ color: '#64748b', fontSize: 13, textDecoration: 'none' }}>
                Admin Login →
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
