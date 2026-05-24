// Dashboard.jsx - Main Dashboard with Stats and Charts
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, CheckCircle, XCircle, IndianRupee, TrendingUp, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { getDashboardStats } from '../api';

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <motion.div
    initial={{ y: 30, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay, duration: 0.5 }}
    className="glass-card"
    style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}
  >
    <div style={{
      width: 56, height: 56, borderRadius: 12, flexShrink: 0,
      background: `${color}22`,
      border: `1px solid ${color}44`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 0 20px ${color}33`
    }}>
      <Icon size={24} color={color} />
    </div>
    <div>
      <div style={{ fontFamily: 'Orbitron', fontSize: 10, color: '#64748b', letterSpacing: 2, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: 'Orbitron', fontSize: 24, fontWeight: 700, color: '#fff' }}>{value}</div>
    </div>
  </motion.div>
);

const COLORS = ['#00f5ff', '#f87171'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats().then(r => { setStats(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
      <div className="neon-text font-orbitron" style={{ fontSize: 18 }}>⚡ LOADING...</div>
    </div>
  );

  const pieData = [
    { name: 'Paid', value: stats?.paidBills || 0 },
    { name: 'Unpaid', value: stats?.unpaidBills || 0 },
  ];

  const chartData = stats?.monthlyRevenue?.map(d => ({
    month: d.month,
    revenue: d.revenue,
    bills: d.bills
  })) || [];

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Zap size={22} color="#00f5ff" />
          <h1 className="font-orbitron" style={{ fontSize: 22, color: '#fff', fontWeight: 700 }}>DASHBOARD</h1>
        </div>
        <p style={{ color: '#64748b', fontSize: 14 }}>Electricity Billing System Overview</p>
      </motion.div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard icon={Users} label="TOTAL CUSTOMERS" value={stats?.totalCustomers ?? 0} color="#0080ff" delay={0} />
        <StatCard icon={FileText} label="TOTAL BILLS" value={stats?.totalBills ?? 0} color="#8b5cf6" delay={0.1} />
        <StatCard icon={CheckCircle} label="PAID BILLS" value={stats?.paidBills ?? 0} color="#22c55e" delay={0.2} />
        <StatCard icon={XCircle} label="UNPAID BILLS" value={stats?.unpaidBills ?? 0} color="#ef4444" delay={0.3} />
        <StatCard icon={IndianRupee} label="REVENUE (₹)" value={`₹${(stats?.revenue ?? 0).toLocaleString()}`} color="#00f5ff" delay={0.4} />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* Area Chart - Monthly Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card"
          style={{ padding: 24 }}
        >
          <div className="font-orbitron" style={{ fontSize: 12, color: '#00f5ff', letterSpacing: 2, marginBottom: 20 }}>
            MONTHLY REVENUE
          </div>
          {chartData.length === 0 ? (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              No billing data yet. Generate some bills!
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f5ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00f5ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid rgba(0,245,255,0.2)', borderRadius: 8, color: '#e2e8f0' }}
                  formatter={(v) => [`₹${v}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#00f5ff" fill="url(#revenueGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Pie Chart - Paid vs Unpaid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card"
          style={{ padding: 24 }}
        >
          <div className="font-orbitron" style={{ fontSize: 12, color: '#00f5ff', letterSpacing: 2, marginBottom: 20 }}>
            BILL STATUS
          </div>
          {(stats?.totalBills || 0) === 0 ? (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', textAlign: 'center', fontSize: 13 }}>
              No bills yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Legend formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 13 }}>{v}</span>} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid rgba(0,245,255,0.2)', borderRadius: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Quick Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="glass-card"
        style={{ padding: 20, marginTop: 20, display: 'flex', gap: 24, flexWrap: 'wrap' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00f5ff', boxShadow: '0 0 6px #00f5ff' }} />
          <span style={{ color: '#64748b', fontSize: 13 }}>Billing Slab: </span>
          <span style={{ color: '#94a3b8', fontSize: 13 }}>0–100 units @ ₹5 | 101–300 @ ₹7 | 300+ @ ₹10</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={14} color="#22c55e" />
          <span style={{ color: '#64748b', fontSize: 13 }}>System Status: </span>
          <span style={{ color: '#22c55e', fontSize: 13, fontWeight: 600 }}>● Online</span>
        </div>
      </motion.div>
    </div>
  );
}
