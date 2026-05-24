// BillHistory.jsx - Bill History Management Page
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Search, CheckCircle, Trash2, Filter } from 'lucide-react';
import { getBills, markAsPaid, deleteBill } from '../api';

export default function BillHistory() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [msg, setMsg] = useState('');

  const load = () => getBills().then(r => { setBills(r.data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3000); };

  const handlePay = async (id) => {
    await markAsPaid(id);
    showMsg('Bill marked as paid!');
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this bill?')) return;
    await deleteBill(id);
    showMsg('Bill deleted');
    load();
  };

  const filtered = bills.filter(b => {
    const matchSearch = b.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.meter_no?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalAmount = filtered.reduce((s, b) => s + b.amount, 0);
  const paidAmount = filtered.filter(b => b.status === 'Paid').reduce((s, b) => s + b.amount, 0);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <History size={22} color="#00f5ff" />
        <h1 className="font-orbitron" style={{ fontSize: 22, color: '#fff' }}>BILL HISTORY</h1>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'TOTAL BILLS', value: filtered.length, color: '#0080ff' },
          { label: 'TOTAL AMOUNT', value: `₹${totalAmount.toFixed(2)}`, color: '#8b5cf6' },
          { label: 'COLLECTED', value: `₹${paidAmount.toFixed(2)}`, color: '#22c55e' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card" style={{ padding: 16, textAlign: 'center' }}>
            <div style={{ fontFamily: 'Orbitron', fontSize: 10, color: '#64748b', letterSpacing: 2, marginBottom: 6 }}>{label}</div>
            <div style={{ fontFamily: 'Orbitron', fontSize: 20, fontWeight: 700, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Toast */}
      <AnimatePresence>
        {msg && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ marginBottom: 16, padding: '10px 16px', borderRadius: 8, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80', fontSize: 14 }}>
            ✓ {msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="glass-card" style={{ padding: 16, marginBottom: 20, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={15} color="#64748b" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by name or meter no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: 34 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['All', 'Paid', 'Unpaid'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontFamily: 'Rajdhani', fontWeight: 600,
              background: statusFilter === s ? 'rgba(0,245,255,0.15)' : 'rgba(255,255,255,0.05)',
              border: statusFilter === s ? '1px solid rgba(0,245,255,0.4)' : '1px solid rgba(255,255,255,0.1)',
              color: statusFilter === s ? '#00f5ff' : '#64748b'
            }}>{s}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading bills...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>
            <History size={40} color="#1e3a5f" style={{ marginBottom: 12 }} />
            <p>No bills found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>BILL ID</th><th>CUSTOMER</th><th>METER NO</th>
                  <th>PREV</th><th>CURR</th><th>UNITS</th>
                  <th>AMOUNT</th><th>STATUS</th><th>DATE</th><th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b, i) => (
                  <motion.tr key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                    <td><span style={{ fontFamily: 'Orbitron', fontSize: 11, color: '#00f5ff' }}>#{b.id}</span></td>
                    <td style={{ fontWeight: 600 }}>{b.customer_name}</td>
                    <td><span style={{ fontFamily: 'Orbitron', fontSize: 11, color: '#94a3b8' }}>{b.meter_no}</span></td>
                    <td>{b.previous_reading}</td>
                    <td>{b.current_reading}</td>
                    <td style={{ fontWeight: 600, color: '#e2e8f0' }}>{b.units}</td>
                    <td style={{ fontFamily: 'Orbitron', fontSize: 13, color: '#00f5ff', fontWeight: 700 }}>₹{b.amount}</td>
                    <td><span className={b.status === 'Paid' ? 'badge-paid' : 'badge-unpaid'}>{b.status}</span></td>
                    <td style={{ color: '#64748b', fontSize: 12 }}>{new Date(b.created_at).toLocaleDateString('en-IN')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {b.status === 'Unpaid' && (
                          <button onClick={() => handlePay(b.id)} className="btn-success" style={{ padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <CheckCircle size={13} />
                          </button>
                        )}
                        <button onClick={() => handleDelete(b.id)} className="btn-danger" style={{ padding: '5px 10px' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
