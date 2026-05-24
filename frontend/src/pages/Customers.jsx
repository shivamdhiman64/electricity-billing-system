// Customers.jsx - Customer Management Page
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Edit2, Trash2, X, Check, Zap } from 'lucide-react';
import { getCustomers, addCustomer, updateCustomer, deleteCustomer } from '../api';

const EMPTY_FORM = { name: '', phone: '', address: '', meter_no: '', connection_type: 'Residential' };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const load = () => getCustomers().then(r => { setCustomers(r.data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  };

  const openAdd = () => { setForm(EMPTY_FORM); setEditingId(null); setShowModal(true); };
  const openEdit = (c) => { setForm({ name: c.name, phone: c.phone, address: c.address, meter_no: c.meter_no, connection_type: c.connection_type }); setEditingId(c.id); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateCustomer(editingId, form);
        showMsg('Customer updated!');
      } else {
        await addCustomer(form);
        showMsg('Customer added!');
      }
      setShowModal(false);
      load();
    } catch (err) { showMsg(err.message, 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this customer and all their bills?')) return;
    await deleteCustomer(id);
    showMsg('Customer deleted');
    load();
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Users size={22} color="#00f5ff" />
            <h1 className="font-orbitron" style={{ fontSize: 22, color: '#fff' }}>CUSTOMERS</h1>
          </div>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>{customers.length} total customers</p>
        </div>
        <button onClick={openAdd} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> ADD CUSTOMER
        </button>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {msg.text && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              marginBottom: 16, padding: '12px 16px', borderRadius: 8,
              background: msg.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
              border: `1px solid ${msg.type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
              color: msg.type === 'error' ? '#f87171' : '#4ade80', fontSize: 14,
              display: 'flex', alignItems: 'center', gap: 8
            }}>
            {msg.type === 'error' ? <X size={16} /> : <Check size={16} />} {msg.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading...</div>
        ) : customers.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>
            <Users size={40} color="#1e3a5f" style={{ marginBottom: 12 }} />
            <p>No customers yet. Click <strong>ADD CUSTOMER</strong> to get started.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th><th>NAME</th><th>PHONE</th><th>ADDRESS</th>
                  <th>METER NO</th><th>CONNECTION</th><th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c, i) => (
                  <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                    <td><span style={{ fontFamily: 'Orbitron', fontSize: 11, color: '#00f5ff' }}>#{c.id}</span></td>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td>{c.phone}</td>
                    <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.address}</td>
                    <td><span style={{ fontFamily: 'Orbitron', fontSize: 12, color: '#94a3b8' }}>{c.meter_no}</span></td>
                    <td>
                      <span style={{
                        background: c.connection_type === 'Commercial' ? 'rgba(139,92,246,0.2)' : 'rgba(0,128,255,0.2)',
                        color: c.connection_type === 'Commercial' ? '#a78bfa' : '#60a5fa',
                        border: `1px solid ${c.connection_type === 'Commercial' ? 'rgba(139,92,246,0.3)' : 'rgba(0,128,255,0.3)'}`,
                        padding: '2px 10px', borderRadius: 20, fontSize: 12
                      }}>{c.connection_type}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => openEdit(c)} style={{
                          background: 'rgba(0,128,255,0.15)', border: '1px solid rgba(0,128,255,0.3)',
                          color: '#60a5fa', padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 13
                        }}>
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => handleDelete(c.id)} className="btn-danger" style={{ padding: '5px 10px' }}>
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

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1000, backdropFilter: 'blur(5px)'
            }}
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card"
              style={{ width: '100%', maxWidth: 500, padding: 32, margin: 16 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Zap size={18} color="#00f5ff" />
                  <h2 className="font-orbitron" style={{ fontSize: 16, color: '#fff' }}>
                    {editingId ? 'EDIT CUSTOMER' : 'ADD CUSTOMER'}
                  </h2>
                </div>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  {[
                    { key: 'name', label: 'FULL NAME', placeholder: 'John Doe' },
                    { key: 'phone', label: 'PHONE', placeholder: '9876543210' },
                    { key: 'meter_no', label: 'METER NUMBER', placeholder: 'MTR001' },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key} style={{ gridColumn: key === 'name' ? 'span 2' : 'auto' }}>
                      <label style={{ display: 'block', color: '#64748b', fontSize: 11, letterSpacing: 1, marginBottom: 6, fontFamily: 'Orbitron' }}>{label}</label>
                      <input
                        type="text"
                        value={form[key]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        placeholder={placeholder}
                        className="input-field"
                        required
                      />
                    </div>
                  ))}
                  <div>
                    <label style={{ display: 'block', color: '#64748b', fontSize: 11, letterSpacing: 1, marginBottom: 6, fontFamily: 'Orbitron' }}>CONNECTION TYPE</label>
                    <select value={form.connection_type} onChange={(e) => setForm({ ...form, connection_type: e.target.value })} className="input-field">
                      <option>Residential</option>
                      <option>Commercial</option>
                      <option>Industrial</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', color: '#64748b', fontSize: 11, letterSpacing: 1, marginBottom: 6, fontFamily: 'Orbitron' }}>ADDRESS</label>
                  <textarea
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Full address"
                    className="input-field"
                    rows={2}
                    required
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="button" onClick={() => setShowModal(false)}
                    style={{ flex: 1, padding: '12px', background: 'rgba(100,116,139,0.2)', border: '1px solid rgba(100,116,139,0.3)', color: '#94a3b8', borderRadius: 8, cursor: 'pointer', fontFamily: 'Rajdhani', fontWeight: 600 }}>
                    CANCEL
                  </button>
                  <button type="submit" className="btn-primary" style={{ flex: 1, padding: '12px' }}>
                    {editingId ? '✓ UPDATE' : '+ ADD CUSTOMER'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
