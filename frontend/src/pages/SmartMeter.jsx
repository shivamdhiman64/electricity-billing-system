// SmartMeter.jsx - Smart Meter Management & Month End Billing
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Zap, RefreshCw, FileText, Bell, CheckCircle, AlertTriangle, Activity } from 'lucide-react';
import { getSmartMeters, simulateReadings, generateAllBills } from '../api';

export default function SmartMeter() {
  const [meters, setMeters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [generatedBills, setGeneratedBills] = useState([]);
  const [showResult, setShowResult] = useState(false);

  const load = () => {
    setLoading(true);
    getSmartMeters().then(r => { setMeters(r.data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 4000);
  };

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const res = await simulateReadings();
      showMsg(`✅ ${res.message}`);
      load();
    } catch (err) { showMsg(err.message, 'error'); }
    finally { setSimulating(false); }
  };

  const handleGenerateAll = async () => {
    if (!confirm('Month End Process: Generate bills for ALL meters with pending readings?')) return;
    setGenerating(true);
    try {
      const res = await generateAllBills();
      if (res.success) {
        setGeneratedBills(res.bills || []);
        setShowResult(true);
        showMsg(`🎉 ${res.message}`);
        load();
      } else {
        showMsg(res.message, 'error');
      }
    } catch (err) { showMsg(err.message, 'error'); }
    finally { setGenerating(false); }
  };

  const pendingCount = meters.filter(m => m.current_reading && !m.bill_generated).length;
  const onlineCount = meters.filter(m => m.status === 'Online').length;
  const totalUnits = meters.reduce((s, m) => s + (m.monthly_units || 0), 0);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Activity size={22} color="#00f5ff" />
            <h1 className="font-orbitron" style={{ fontSize: 22, color: '#fff' }}>SMART METER PANEL</h1>
          </div>
          <p style={{ color: '#64748b', fontSize: 14 }}>Online meter management & month-end bulk billing</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={load} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
            background: 'rgba(100,116,139,0.2)', border: '1px solid rgba(100,116,139,0.3)',
            borderRadius: 8, cursor: 'pointer', color: '#94a3b8', fontSize: 13
          }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={handleSimulate} disabled={simulating} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
            background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)',
            borderRadius: 8, cursor: 'pointer', color: '#a78bfa', fontSize: 13, fontWeight: 600
          }}>
            <Wifi size={14} /> {simulating ? 'Updating...' : 'Fetch Meter Readings'}
          </button>
          <button onClick={handleGenerateAll} disabled={generating || pendingCount === 0} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
            background: pendingCount === 0 ? 'rgba(100,116,139,0.1)' : 'linear-gradient(135deg, #0080ff, #00f5ff)',
            border: 'none', borderRadius: 8, cursor: pendingCount === 0 ? 'not-allowed' : 'pointer',
            color: pendingCount === 0 ? '#64748b' : '#000',
            fontFamily: 'Orbitron', fontSize: 11, fontWeight: 700, letterSpacing: 1
          }}>
            <FileText size={14} /> {generating ? 'GENERATING...' : `MONTH END — GENERATE ALL (${pendingCount})`}
          </button>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {msg.text && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              marginBottom: 16, padding: '12px 16px', borderRadius: 8,
              background: msg.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
              border: `1px solid ${msg.type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
              color: msg.type === 'error' ? '#f87171' : '#4ade80', fontSize: 14
            }}>
            {msg.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'TOTAL METERS', value: meters.length, icon: Activity, color: '#00f5ff' },
          { label: 'ONLINE', value: onlineCount, icon: Wifi, color: '#22c55e' },
          { label: 'OFFLINE', value: meters.length - onlineCount, icon: WifiOff, color: '#ef4444' },
          { label: 'PENDING BILLS', value: pendingCount, icon: AlertTriangle, color: '#f59e0b' },
          { label: 'TOTAL UNITS', value: `${totalUnits.toFixed(0)} kWh`, icon: Zap, color: '#8b5cf6' },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <motion.div key={label} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.08 }}
            className="glass-card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: `${color}22`, border: `1px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <div style={{ fontFamily: 'Orbitron', fontSize: 9, color: '#64748b', letterSpacing: 1.5, marginBottom: 3 }}>{label}</div>
              <div style={{ fontFamily: 'Orbitron', fontSize: 20, fontWeight: 700, color: '#fff' }}>{value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* How it works */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="glass-card" style={{ padding: 20, marginBottom: 20, background: 'rgba(0,128,255,0.05)', border: '1px solid rgba(0,128,255,0.2)' }}>
        <div className="font-orbitron" style={{ fontSize: 11, color: '#00f5ff', letterSpacing: 2, marginBottom: 12 }}>HOW SMART METER WORKS</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {[
            { step: '1', text: 'Meters are online & connected', color: '#22c55e' },
            { step: '→', text: '', color: '#64748b' },
            { step: '2', text: 'Click "Fetch Meter Readings"', color: '#8b5cf6' },
            { step: '→', text: '', color: '#64748b' },
            { step: '3', text: 'Month end: Generate All Bills', color: '#0080ff' },
            { step: '→', text: '', color: '#64748b' },
            { step: '4', text: 'All customers notified', color: '#00f5ff' },
          ].map(({ step, text, color }, i) => (
            text ? (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: `${color}15`, border: `1px solid ${color}33`, borderRadius: 8 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'Orbitron', fontSize: 10, color: '#000', fontWeight: 700 }}>{step}</span>
                </div>
                <span style={{ color: '#94a3b8', fontSize: 13 }}>{text}</span>
              </div>
            ) : (
              <span key={i} style={{ color: '#64748b', fontSize: 18 }}>→</span>
            )
          ))}
        </div>
      </motion.div>

      {/* Charge Breakdown Info */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        className="glass-card" style={{ padding: 20, marginBottom: 20 }}>
        <div className="font-orbitron" style={{ fontSize: 11, color: '#f59e0b', letterSpacing: 2, marginBottom: 12 }}>BILL CHARGE BREAKDOWN (AUTO APPLIED)</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'Units Charge', desc: 'Slab: ₹5/₹7/₹10', color: '#00f5ff' },
            { label: 'Online Meter Charge', desc: '₹50 fixed', color: '#8b5cf6' },
            { label: 'Service Charge', desc: '₹30 fixed', color: '#f59e0b' },
            { label: 'GST', desc: '18% on total', color: '#ef4444' },
          ].map(({ label, desc, color }) => (
            <div key={label} style={{ padding: '10px 16px', background: `${color}10`, border: `1px solid ${color}30`, borderRadius: 8, minWidth: 140 }}>
              <div style={{ color, fontFamily: 'Orbitron', fontSize: 10, marginBottom: 4 }}>{label}</div>
              <div style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600 }}>{desc}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Meters Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(0,245,255,0.1)' }}>
          <div className="font-orbitron" style={{ fontSize: 12, color: '#00f5ff', letterSpacing: 2 }}>ALL SMART METERS — LIVE STATUS</div>
        </div>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading meters...</div>
        ) : meters.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>
            <p>No customers found. Add customers first, then fetch readings.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>STATUS</th>
                  <th>CUSTOMER</th>
                  <th>METER NO</th>
                  <th>CONNECTION</th>
                  <th>PREV READING</th>
                  <th>CURR READING</th>
                  <th>UNITS THIS MONTH</th>
                  <th>BILL STATUS</th>
                  <th>LAST UPDATED</th>
                </tr>
              </thead>
              <tbody>
                {meters.map((m, i) => (
                  <motion.tr key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: m.status === 'Online' ? '#22c55e' : '#ef4444',
                          boxShadow: m.status === 'Online' ? '0 0 6px #22c55e' : '0 0 6px #ef4444',
                          animation: m.status === 'Online' ? 'pulse 2s infinite' : 'none'
                        }} />
                        <span style={{ color: m.status === 'Online' ? '#4ade80' : '#f87171', fontSize: 12 }}>
                          {m.status || 'Offline'}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{m.name}</td>
                    <td><span style={{ fontFamily: 'Orbitron', fontSize: 11, color: '#00f5ff' }}>{m.meter_no}</span></td>
                    <td>
                      <span style={{
                        background: m.connection_type === 'Commercial' ? 'rgba(139,92,246,0.2)' : 'rgba(0,128,255,0.2)',
                        color: m.connection_type === 'Commercial' ? '#a78bfa' : '#60a5fa',
                        padding: '2px 10px', borderRadius: 20, fontSize: 12
                      }}>{m.connection_type || 'Residential'}</span>
                    </td>
                    <td style={{ color: '#94a3b8' }}>{m.previous_reading ? `${m.previous_reading} kWh` : '—'}</td>
                    <td style={{ fontWeight: 600 }}>{m.current_reading ? `${m.current_reading} kWh` : '—'}</td>
                    <td>
                      <span style={{ fontFamily: 'Orbitron', fontSize: 13, color: '#fff', fontWeight: 700 }}>
                        {m.monthly_units ? `${m.monthly_units} kWh` : '—'}
                      </span>
                    </td>
                    <td>
                      {!m.current_reading ? (
                        <span style={{ color: '#64748b', fontSize: 12 }}>No Reading</span>
                      ) : m.bill_generated ? (
                        <span className="badge-paid">Bill Generated ✓</span>
                      ) : (
                        <span className="badge-unpaid">Pending Bill</span>
                      )}
                    </td>
                    <td style={{ color: '#64748b', fontSize: 12 }}>
                      {m.last_updated ? new Date(m.last_updated).toLocaleDateString('en-IN') : '—'}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Generated Bills Result Modal */}
      <AnimatePresence>
        {showResult && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
            <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
              className="glass-card" style={{ width: '100%', maxWidth: 560, padding: 36, margin: 16, maxHeight: '80vh', overflowY: 'auto' }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,197,94,0.2)', border: '2px solid rgba(34,197,94,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <CheckCircle size={32} color="#4ade80" />
                </div>
                <h2 className="font-orbitron" style={{ color: '#4ade80', fontSize: 18 }}>BILLS GENERATED!</h2>
                <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
                  {generatedBills.length} bills generated & notifications sent
                </p>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, overflow: 'hidden', marginBottom: 20 }}>
                <div style={{ padding: '10px 16px', background: 'rgba(0,245,255,0.1)', display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 16 }}>
                  <span className="font-orbitron" style={{ fontSize: 10, color: '#00f5ff' }}>CUSTOMER</span>
                  <span className="font-orbitron" style={{ fontSize: 10, color: '#00f5ff' }}>UNITS</span>
                  <span className="font-orbitron" style={{ fontSize: 10, color: '#00f5ff' }}>AMOUNT</span>
                </div>
                {generatedBills.map((b, i) => (
                  <div key={i} style={{ padding: '10px 16px', display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 16, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ color: '#e2e8f0', fontSize: 14 }}>{b.customer}</span>
                    <span style={{ color: '#94a3b8', fontSize: 14 }}>{b.units} kWh</span>
                    <span style={{ fontFamily: 'Orbitron', color: '#4ade80', fontSize: 14, fontWeight: 700 }}>₹{b.amount}</span>
                  </div>
                ))}
                <div style={{ padding: '12px 16px', display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 16, background: 'rgba(0,245,255,0.05)' }}>
                  <span className="font-orbitron" style={{ fontSize: 11, color: '#00f5ff' }}>TOTAL</span>
                  <span style={{ color: '#94a3b8' }}></span>
                  <span className="font-orbitron" style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>
                    ₹{generatedBills.reduce((s, b) => s + b.amount, 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, padding: 12, marginBottom: 20, fontSize: 13, color: '#4ade80', textAlign: 'center' }}>
                🔔 Notifications sent to all customers on their portal!
              </div>

              <button onClick={() => setShowResult(false)} className="btn-primary" style={{ width: '100%', padding: 14 }}>
                CLOSE
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
