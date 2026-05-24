// CustomerDashboard.jsx - Customer Self-Service Portal
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, LogOut, User, Hash, Phone, MapPin, Wifi,
  FileText, CheckCircle, XCircle, IndianRupee, Calendar,
  TrendingUp, Download, RefreshCw, Bell
} from 'lucide-react';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { getCustomerBills, getNotifications, markNotifRead } from '../api';

export default function CustomerDashboard() {
  const { customer, logoutCustomer } = useCustomerAuth();
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedBill, setSelectedBill] = useState(null);

  useEffect(() => {
    if (!customer) { navigate('/customer/login'); return; }
    getCustomerBills(customer.id)
      .then(r => { setBills(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [customer]);

  const handleLogout = () => { logoutCustomer(); navigate('/customer/login'); };

  const filtered = bills.filter(b => {
    if (activeTab === 'paid') return b.status === 'Paid';
    if (activeTab === 'unpaid') return b.status === 'Unpaid';
    return true;
  });

  const totalAmount = bills.reduce((s, b) => s + b.amount, 0);
  const paidAmount = bills.filter(b => b.status === 'Paid').reduce((s, b) => s + b.amount, 0);
  const pendingAmount = bills.filter(b => b.status === 'Unpaid').reduce((s, b) => s + b.amount, 0);
  const totalUnits = bills.reduce((s, b) => s + b.units, 0);

  if (!customer) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #020817, #0a1628, #020817)' }} className="bg-grid">

      {/* Top Navbar */}
      <header style={{
        background: 'rgba(5,10,25,0.95)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(34,197,94,0.15)',
        padding: '0 24px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'linear-gradient(135deg, #16a34a, #4ade80)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 15px rgba(34,197,94,0.4)'
          }}>
            <Zap size={20} color="#000" />
          </div>
          <div>
            <div style={{ fontFamily: 'Orbitron', fontSize: 11, color: '#4ade80', letterSpacing: 2 }}>ELECTRIC</div>
            <div style={{ fontFamily: 'Orbitron', fontSize: 12, color: '#fff', fontWeight: 700 }}>CUSTOMER PORTAL</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Orbitron', fontSize: 11, color: '#4ade80' }}>{customer.name}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{customer.meter_no}</div>
          </div>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 8, padding: '8px 14px', cursor: 'pointer', color: '#f87171', fontSize: 13
          }}>
            <LogOut size={15} /> Logout
          </button>
        </div>
      </header>

      <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>

        {/* Welcome Banner */}
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="glass-card" style={{
            padding: 28, marginBottom: 24,
            background: 'linear-gradient(135deg, rgba(22,163,74,0.15), rgba(0,245,255,0.08))',
            border: '1px solid rgba(34,197,94,0.25)'
          }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontFamily: 'Orbitron', fontSize: 20, color: '#fff', marginBottom: 6 }}>
                Welcome, <span style={{ color: '#4ade80' }}>{customer.name}</span> 👋
              </h1>
              <p style={{ color: '#64748b', fontSize: 14 }}>View your electricity bills and payment history</p>
            </div>
            <button onClick={() => { setLoading(true); getCustomerBills(customer.id).then(r => { setBills(r.data); setLoading(false); }); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
                borderRadius: 8, padding: '8px 16px', cursor: 'pointer', color: '#4ade80', fontSize: 13
              }}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </motion.div>

        {/* Customer Info Card */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: 'Orbitron', fontSize: 11, color: '#4ade80', letterSpacing: 2, marginBottom: 16 }}>
            ACCOUNT INFORMATION
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {[
              { icon: User, label: 'Name', value: customer.name, color: '#4ade80' },
              { icon: Hash, label: 'Meter Number', value: customer.meter_no, color: '#00f5ff' },
              { icon: Phone, label: 'Phone', value: customer.phone, color: '#a78bfa' },
              { icon: Wifi, label: 'Connection Type', value: customer.connection_type, color: '#f59e0b' },
              { icon: MapPin, label: 'Address', value: customer.address, color: '#60a5fa' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}22`, border: `1px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} color={color} />
                </div>
                <div>
                  <div style={{ color: '#64748b', fontSize: 11, marginBottom: 2 }}>{label}</div>
                  <div style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600 }}>{value}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'TOTAL BILLS', value: bills.length, icon: FileText, color: '#0080ff' },
            { label: 'PAID BILLS', value: bills.filter(b => b.status === 'Paid').length, icon: CheckCircle, color: '#22c55e' },
            { label: 'UNPAID BILLS', value: bills.filter(b => b.status === 'Unpaid').length, icon: XCircle, color: '#ef4444' },
            { label: 'TOTAL PAID', value: `₹${paidAmount.toFixed(0)}`, icon: IndianRupee, color: '#4ade80' },
            { label: 'PENDING', value: `₹${pendingAmount.toFixed(0)}`, icon: TrendingUp, color: '#f87171' },
            { label: 'TOTAL UNITS', value: `${totalUnits.toFixed(0)} kWh`, icon: Zap, color: '#00f5ff' },
          ].map(({ label, value, icon: Icon, color }, i) => (
            <motion.div key={label} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 + i * 0.05 }}
              className="glass-card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: `${color}22`, border: `1px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={20} color={color} />
              </div>
              <div>
                <div style={{ fontFamily: 'Orbitron', fontSize: 9, color: '#64748b', letterSpacing: 1.5, marginBottom: 3 }}>{label}</div>
                <div style={{ fontFamily: 'Orbitron', fontSize: 18, fontWeight: 700, color: '#fff' }}>{value}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bills Table */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card" style={{ overflow: 'hidden' }}>
          {/* Table Header */}
          <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(0,245,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ fontFamily: 'Orbitron', fontSize: 12, color: '#4ade80', letterSpacing: 2 }}>
              BILLING HISTORY
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['all', 'paid', 'unpaid'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  padding: '6px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 12,
                  fontFamily: 'Orbitron', letterSpacing: 1, textTransform: 'uppercase',
                  background: activeTab === tab ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)',
                  border: activeTab === tab ? '1px solid rgba(34,197,94,0.5)' : '1px solid rgba(255,255,255,0.1)',
                  color: activeTab === tab ? '#4ade80' : '#64748b'
                }}>{tab}</button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>Loading bills...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>
              <FileText size={40} color="#1e3a5f" style={{ marginBottom: 12 }} />
              <p>No bills found.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>BILL ID</th>
                    <th>DATE</th>
                    <th>PREV READING</th>
                    <th>CURR READING</th>
                    <th>UNITS</th>
                    <th>AMOUNT</th>
                    <th>STATUS</th>
                    <th>DETAILS</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b, i) => (
                    <motion.tr key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                      <td><span style={{ fontFamily: 'Orbitron', fontSize: 11, color: '#4ade80' }}>#{b.id}</span></td>
                      <td style={{ color: '#64748b', fontSize: 13 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Calendar size={13} color="#64748b" />
                          {new Date(b.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                      <td>{b.previous_reading} kWh</td>
                      <td>{b.current_reading} kWh</td>
                      <td style={{ fontWeight: 600, color: '#e2e8f0' }}>{b.units} kWh</td>
                      <td style={{ fontFamily: 'Orbitron', fontSize: 14, fontWeight: 700, color: b.status === 'Paid' ? '#4ade80' : '#f87171' }}>
                        ₹{b.amount}
                      </td>
                      <td><span className={b.status === 'Paid' ? 'badge-paid' : 'badge-unpaid'}>{b.status}</span></td>
                      <td>
                        <button onClick={() => setSelectedBill(b)} style={{
                          background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.2)',
                          color: '#00f5ff', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12
                        }}>
                          View
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Billing Slab Info */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="glass-card" style={{ padding: 20, marginTop: 20 }}>
          <div style={{ fontFamily: 'Orbitron', fontSize: 10, color: '#64748b', letterSpacing: 2, marginBottom: 12 }}>
            BILLING SLABS (FOR YOUR REFERENCE)
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { range: '0 – 100 units', rate: '₹5 / unit', color: '#22c55e' },
              { range: '101 – 300 units', rate: '₹7 / unit', color: '#f59e0b' },
              { range: '301+ units', rate: '₹10 / unit', color: '#ef4444' },
            ].map(({ range, rate, color }) => (
              <div key={range} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', background: `${color}15`, border: `1px solid ${color}33`, borderRadius: 8 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
                <span style={{ color: '#94a3b8', fontSize: 13 }}>{range}</span>
                <span style={{ color, fontFamily: 'Orbitron', fontSize: 11, fontWeight: 700 }}>{rate}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bill Detail Modal */}
      <AnimatePresence>
        {selectedBill && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedBill(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
            <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="glass-card" style={{ width: '100%', maxWidth: 460, padding: 36, margin: 16 }}>

              {/* Receipt Header */}
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{
                  width: 60, height: 60, borderRadius: '50%', margin: '0 auto 12px',
                  background: 'linear-gradient(135deg, #16a34a, #4ade80)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 25px rgba(34,197,94,0.4)'
                }}>
                  <Zap size={28} color="#000" />
                </div>
                <div style={{ fontFamily: 'Orbitron', fontSize: 18, color: '#fff', fontWeight: 700 }}>ELECTRICITY BILL</div>
                <div style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
                  Bill #{selectedBill.id} • {new Date(selectedBill.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
              </div>

              {/* Divider */}
              <div style={{ borderTop: '1px dashed rgba(0,245,255,0.2)', marginBottom: 20 }} />

              {/* Bill Details */}
              <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
                {[
                  ['Customer Name', customer.name],
                  ['Meter Number', customer.meter_no],
                  ['Connection Type', customer.connection_type],
                  ['Previous Reading', `${selectedBill.previous_reading} kWh`],
                  ['Current Reading', `${selectedBill.current_reading} kWh`],
                  ['Units Consumed', `${selectedBill.units} kWh`],
                  ['Bill Date', new Date(selectedBill.created_at).toLocaleDateString('en-IN')],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 14 }}>
                    <span style={{ color: '#64748b' }}>{label}</span>
                    <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Amount + Status */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: selectedBill.status === 'Paid' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                border: `1px solid ${selectedBill.status === 'Paid' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                borderRadius: 12, padding: '16px 20px', marginBottom: 20
              }}>
                <div>
                  <div style={{ fontFamily: 'Orbitron', fontSize: 10, color: '#64748b', letterSpacing: 2, marginBottom: 4 }}>TOTAL AMOUNT</div>
                  <div style={{ fontFamily: 'Orbitron', fontSize: 28, fontWeight: 700, color: '#fff' }}>₹{selectedBill.amount}</div>
                </div>
                <span className={selectedBill.status === 'Paid' ? 'badge-paid' : 'badge-unpaid'} style={{ fontSize: 14, padding: '6px 16px' }}>
                  {selectedBill.status}
                </span>
              </div>

              {selectedBill.status === 'Unpaid' && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#f87171', textAlign: 'center' }}>
                  ⚠️ Please visit the office to pay this bill
                </div>
              )}

              <button onClick={() => setSelectedBill(null)} style={{
                width: '100%', padding: '12px',
                background: 'linear-gradient(135deg, #16a34a, #4ade80)',
                color: '#000', fontWeight: 700, borderRadius: 8, border: 'none',
                cursor: 'pointer', fontFamily: 'Orbitron', fontSize: 12, letterSpacing: 1
              }}>
                CLOSE
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
