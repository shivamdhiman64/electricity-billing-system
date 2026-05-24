// Reports.jsx - Analytics and Reports Page
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Zap } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend, RadialBarChart, RadialBar
} from 'recharts';
import { getDashboardStats, getBills } from '../api';

const COLORS = ['#00f5ff', '#f87171', '#22c55e', '#8b5cf6', '#f59e0b'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#0f172a', border: '1px solid rgba(0,245,255,0.2)', borderRadius: 8, padding: '10px 14px' }}>
        <p style={{ color: '#00f5ff', fontFamily: 'Orbitron', fontSize: 11, marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: '#e2e8f0', fontSize: 13 }}>
            {p.name}: <strong style={{ color: p.color }}>{p.name === 'revenue' ? `₹${p.value}` : p.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Reports() {
  const [stats, setStats] = useState(null);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboardStats(), getBills()]).then(([sRes, bRes]) => {
      setStats(sRes.data);
      setBills(bRes.data);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
      <div className="neon-text font-orbitron" style={{ fontSize: 18 }}>⚡ LOADING REPORTS...</div>
    </div>
  );

  const pieData = [
    { name: 'Paid Bills', value: stats?.paidBills || 0, fill: '#22c55e' },
    { name: 'Unpaid Bills', value: stats?.unpaidBills || 0, fill: '#ef4444' },
  ];

  const radialData = [
    { name: 'Revenue Goal', value: Math.min(100, (stats?.revenue / 10000) * 100 || 0), fill: '#00f5ff' },
  ];

  const connectionData = bills.reduce((acc, b) => {
    const type = b.connection_type || 'Residential';
    const found = acc.find(a => a.name === type);
    if (found) { found.value += b.amount; found.count++; }
    else acc.push({ name: type, value: b.amount, count: 1 });
    return acc;
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <BarChart3 size={22} color="#00f5ff" />
        <h1 className="font-orbitron" style={{ fontSize: 22, color: '#fff' }}>REPORTS & ANALYTICS</h1>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'TOTAL REVENUE', value: `₹${(stats?.revenue || 0).toLocaleString()}`, color: '#00f5ff', sub: 'from paid bills' },
          { label: 'AVG BILL AMOUNT', value: `₹${bills.length ? (bills.reduce((s,b)=>s+b.amount,0)/bills.length).toFixed(0) : 0}`, color: '#8b5cf6', sub: 'per bill' },
          { label: 'PAYMENT RATE', value: `${stats?.totalBills ? Math.round(stats.paidBills/stats.totalBills*100) : 0}%`, color: '#22c55e', sub: 'bills paid' },
          { label: 'PENDING AMOUNT', value: `₹${bills.filter(b=>b.status==='Unpaid').reduce((s,b)=>s+b.amount,0).toLocaleString()}`, color: '#ef4444', sub: 'to collect' },
        ].map(({ label, value, color, sub }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-card" style={{ padding: 20 }}>
            <div style={{ fontFamily: 'Orbitron', fontSize: 9, color: '#64748b', letterSpacing: 2, marginBottom: 8 }}>{label}</div>
            <div style={{ fontFamily: 'Orbitron', fontSize: 22, fontWeight: 700, color, marginBottom: 4 }}>{value}</div>
            <div style={{ color: '#64748b', fontSize: 12 }}>{sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20, marginBottom: 20 }}>
        {/* Monthly Revenue Bar Chart */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card" style={{ padding: 24 }}>
          <div className="font-orbitron" style={{ fontSize: 12, color: '#00f5ff', letterSpacing: 2, marginBottom: 20 }}>MONTHLY REVENUE TREND</div>
          {(stats?.monthlyRevenue || []).length === 0 ? (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" fill="#0080ff" radius={[4, 4, 0, 0]}>
                  {stats.monthlyRevenue.map((_, i) => (
                    <Cell key={i} fill={`hsl(${200 + i * 10}, 90%, 60%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Pie Chart - Paid vs Unpaid */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card" style={{ padding: 24 }}>
          <div className="font-orbitron" style={{ fontSize: 12, color: '#00f5ff', letterSpacing: 2, marginBottom: 20 }}>PAYMENT STATUS</div>
          {stats?.totalBills === 0 ? (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={85} dataKey="value" label={({ name, percent }) => `${(percent*100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
                <Legend formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{v}</span>} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(0,245,255,0.2)', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Connection Type Revenue */}
      {connectionData.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="glass-card" style={{ padding: 24 }}>
          <div className="font-orbitron" style={{ fontSize: 12, color: '#00f5ff', letterSpacing: 2, marginBottom: 20 }}>REVENUE BY CONNECTION TYPE</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={connectionData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" stroke="#64748b" fontSize={11} tickFormatter={v => `₹${v}`} />
              <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={12} width={90} />
              <Tooltip content={<CustomTooltip />} formatter={(v) => [`₹${v}`, 'Revenue']} />
              <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]}>
                {connectionData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Bill Count per Month */}
      {(stats?.monthlyRevenue || []).length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="glass-card" style={{ padding: 24, marginTop: 20 }}>
          <div className="font-orbitron" style={{ fontSize: 12, color: '#00f5ff', letterSpacing: 2, marginBottom: 20 }}>MONTHLY BILL COUNT</div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={stats.monthlyRevenue}>
              <defs>
                <linearGradient id="billsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="bills" stroke="#8b5cf6" fill="url(#billsGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
}
