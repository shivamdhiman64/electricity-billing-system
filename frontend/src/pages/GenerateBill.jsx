// GenerateBill.jsx - Bill Generation Page
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Zap, Calculator, Printer, X } from 'lucide-react';
import { getCustomers, generateBill } from '../api';

function calcAmount(units) {
  if (units <= 100) return units * 5;
  if (units <= 300) return 100 * 5 + (units - 100) * 7;
  return 100 * 5 + 200 * 7 + (units - 300) * 10;
}

export default function GenerateBill() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ customer_id: '', previous_reading: '', current_reading: '' });
  const [preview, setPreview] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { getCustomers().then(r => setCustomers(r.data)); }, []);

  const selectedCustomer = customers.find(c => c.id === parseInt(form.customer_id));
  const units = form.current_reading && form.previous_reading
    ? parseFloat(form.current_reading) - parseFloat(form.previous_reading) : null;
  const amount = units !== null && units >= 0 ? calcAmount(units) : null;

  const handleChange = (e) => {
    const updated = { ...form, [e.target.name]: e.target.value };
    setForm(updated);
    setError('');
    if (updated.current_reading && updated.previous_reading) {
      const u = parseFloat(updated.current_reading) - parseFloat(updated.previous_reading);
      if (u < 0) setError('Current reading cannot be less than previous reading');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (units < 0) return;
    setLoading(true);
    try {
      const res = await generateBill({
        customer_id: parseInt(form.customer_id),
        previous_reading: parseFloat(form.previous_reading),
        current_reading: parseFloat(form.current_reading)
      });
      setReceipt(res.data);
      setForm({ customer_id: '', previous_reading: '', current_reading: '' });
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <FileText size={22} color="#00f5ff" />
        <h1 className="font-orbitron" style={{ fontSize: 22, color: '#fff' }}>GENERATE BILL</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Form */}
        <div className="glass-card" style={{ padding: 28 }}>
          <div className="font-orbitron" style={{ fontSize: 12, color: '#00f5ff', letterSpacing: 2, marginBottom: 22 }}>
            BILL DETAILS
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#f87171', fontSize: 14 }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', color: '#64748b', fontSize: 11, letterSpacing: 1, marginBottom: 6, fontFamily: 'Orbitron' }}>SELECT CUSTOMER</label>
              <select name="customer_id" value={form.customer_id} onChange={handleChange} className="input-field" required>
                <option value="">-- Choose Customer --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} — {c.meter_no}</option>
                ))}
              </select>
            </div>

            {selectedCustomer && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ background: 'rgba(0,245,255,0.05)', border: '1px solid rgba(0,245,255,0.15)', borderRadius: 8, padding: 14, marginBottom: 18 }}>
                <div style={{ fontSize: 13, color: '#94a3b8' }}>
                  <div><span style={{ color: '#64748b' }}>Meter:</span> <span style={{ color: '#00f5ff', fontFamily: 'Orbitron', fontSize: 12 }}>{selectedCustomer.meter_no}</span></div>
                  <div><span style={{ color: '#64748b' }}>Type:</span> {selectedCustomer.connection_type}</div>
                  <div><span style={{ color: '#64748b' }}>Address:</span> {selectedCustomer.address}</div>
                </div>
              </motion.div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', color: '#64748b', fontSize: 11, letterSpacing: 1, marginBottom: 6, fontFamily: 'Orbitron' }}>PREVIOUS READING</label>
                <input type="number" name="previous_reading" value={form.previous_reading} onChange={handleChange}
                  placeholder="e.g. 1200" className="input-field" min="0" step="0.01" required />
              </div>
              <div>
                <label style={{ display: 'block', color: '#64748b', fontSize: 11, letterSpacing: 1, marginBottom: 6, fontFamily: 'Orbitron' }}>CURRENT READING</label>
                <input type="number" name="current_reading" value={form.current_reading} onChange={handleChange}
                  placeholder="e.g. 1350" className="input-field" min="0" step="0.01" required />
              </div>
            </div>

            <button type="submit" disabled={loading || !!error || !form.customer_id} className="btn-primary" style={{ width: '100%', padding: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Calculator size={16} />
              {loading ? 'GENERATING...' : 'GENERATE BILL'}
            </button>
          </form>
        </div>

        {/* Live Preview */}
        <div className="glass-card" style={{ padding: 28 }}>
          <div className="font-orbitron" style={{ fontSize: 12, color: '#00f5ff', letterSpacing: 2, marginBottom: 22 }}>
            LIVE PREVIEW
          </div>

          {!selectedCustomer || units === null ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, color: '#64748b' }}>
              <Zap size={40} color="#1e3a5f" style={{ marginBottom: 12 }} />
              <p>Select customer and enter readings to preview bill</p>
            </div>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                {[
                  { label: 'Customer', value: selectedCustomer?.name, color: '#fff' },
                  { label: 'Meter No', value: selectedCustomer?.meter_no, color: '#00f5ff' },
                  { label: 'Previous', value: form.previous_reading || '—', color: '#94a3b8' },
                  { label: 'Current', value: form.current_reading || '—', color: '#94a3b8' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 12 }}>
                    <div style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>{label}</div>
                    <div style={{ color, fontWeight: 600, fontSize: 15 }}>{value}</div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid rgba(0,245,255,0.1)', paddingTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: '#64748b' }}>Units Consumed:</span>
                  <span style={{ fontFamily: 'Orbitron', color: '#fff', fontSize: 16 }}>{units >= 0 ? units : '—'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: '#64748b' }}>Slab Breakdown:</span>
                  <span style={{ color: '#94a3b8', fontSize: 12 }}>
                    {units > 0 ? (
                      units <= 100 ? `${units}×₹5` :
                      units <= 300 ? `100×₹5 + ${units-100}×₹7` :
                      `100×₹5 + 200×₹7 + ${units-300}×₹10`
                    ) : '—'}
                  </span>
                </div>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', marginTop: 12,
                  background: 'linear-gradient(135deg, rgba(0,128,255,0.15), rgba(0,245,255,0.15))',
                  borderRadius: 10, padding: '14px 16px',
                  border: '1px solid rgba(0,245,255,0.2)'
                }}>
                  <span className="font-orbitron" style={{ color: '#00f5ff', fontSize: 12 }}>TOTAL AMOUNT</span>
                  <span className="font-orbitron" style={{ color: '#fff', fontSize: 22, fontWeight: 700 }}>
                    {amount !== null && units >= 0 ? `₹${amount.toFixed(2)}` : '—'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Billing Slab Info */}
      <div className="glass-card" style={{ padding: 20, marginTop: 20 }}>
        <div className="font-orbitron" style={{ fontSize: 11, color: '#64748b', letterSpacing: 2, marginBottom: 12 }}>BILLING SLABS</div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {[
            { range: '0 – 100 units', rate: '₹5 / unit', color: '#22c55e' },
            { range: '101 – 300 units', rate: '₹7 / unit', color: '#f59e0b' },
            { range: '301+ units', rate: '₹10 / unit', color: '#ef4444' },
          ].map(({ range, rate, color }) => (
            <div key={range} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', background: `${color}15`, border: `1px solid ${color}33`, borderRadius: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
              <span style={{ color: '#94a3b8', fontSize: 13 }}>{range}</span>
              <span style={{ color, fontFamily: 'Orbitron', fontSize: 12, fontWeight: 700 }}>{rate}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Receipt Modal */}
      <AnimatePresence>
        {receipt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              className="glass-card" style={{ width: '100%', maxWidth: 440, padding: 32, margin: 16 }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(34,197,94,0.2)', border: '2px solid rgba(34,197,94,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <span style={{ fontSize: 24 }}>✓</span>
                </div>
                <h2 className="font-orbitron" style={{ color: '#4ade80', fontSize: 16 }}>BILL GENERATED!</h2>
                <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>Bill #{receipt.id}</p>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 20, marginBottom: 20, border: '1px solid rgba(0,245,255,0.1)' }}>
                {[
                  ['Customer', receipt.customer_name],
                  ['Meter No', receipt.meter_no],
                  ['Previous Reading', `${receipt.previous_reading} kWh`],
                  ['Current Reading', `${receipt.current_reading} kWh`],
                  ['Units Consumed', `${receipt.units} kWh`],
                  ['Status', 'Unpaid'],
                  ['Date', new Date(receipt.created_at).toLocaleDateString('en-IN')],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 14 }}>
                    <span style={{ color: '#64748b' }}>{label}</span>
                    <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0', fontSize: 18 }}>
                  <span className="font-orbitron" style={{ color: '#00f5ff', fontSize: 13 }}>TOTAL AMOUNT</span>
                  <span className="font-orbitron" style={{ color: '#fff', fontWeight: 700 }}>₹{receipt.amount}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setReceipt(null)} className="btn-primary" style={{ flex: 1, padding: '12px' }}>
                  CLOSE
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
