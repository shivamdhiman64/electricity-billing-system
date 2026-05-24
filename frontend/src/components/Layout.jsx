// Layout.jsx - Main Layout with Sidebar and Navbar
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, FileText, History, BarChart3,
  LogOut, Zap, Menu, X, ChevronRight, Activity
} from 'lucide-react';

const navItems = [
  { path: '/dashboard',     label: 'Dashboard',    icon: LayoutDashboard },
  { path: '/customers',     label: 'Customers',    icon: Users },
  { path: '/generate-bill', label: 'Generate Bill',icon: FileText },
  { path: '/bill-history',  label: 'Bill History', icon: History },
  { path: '/reports',       label: 'Reports',      icon: BarChart3 },
  { path: '/smart-meter',   label: 'Smart Meter',  icon: Activity },
];

export default function Layout() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#020817' }}>

      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 260 : 70 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{
          position: 'fixed', left: 0, top: 0, height: '100vh', zIndex: 100,
          background: 'rgba(5, 10, 25, 0.98)',
          borderRight: '1px solid rgba(0,245,255,0.15)',
          backdropFilter: 'blur(20px)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        {/* Logo */}
        <div style={{
          padding: '20px 16px',
          borderBottom: '1px solid rgba(0,245,255,0.1)',
          display: 'flex', alignItems: 'center', gap: 12
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #0080ff, #00f5ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(0,245,255,0.5)'
          }}>
            <Zap size={22} color="#000" />
          </div>
          {sidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
              <div style={{ fontFamily: 'Orbitron', fontSize: 11, color: '#00f5ff', letterSpacing: 2 }}>ELECTRIC</div>
              <div style={{ fontFamily: 'Orbitron', fontSize: 13, color: '#fff', fontWeight: 700, letterSpacing: 1 }}>BILLING</div>
            </motion.div>
          )}
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink key={path} to={path} style={{ textDecoration: 'none', display: 'block', padding: '4px 8px' }}>
              {({ isActive }) => (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', borderRadius: 10,
                  background: isActive ? 'rgba(0,245,255,0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(0,245,255,0.3)' : '1px solid transparent',
                  transition: 'all 0.2s', cursor: 'pointer',
                }}>
                  <Icon size={20} color={isActive ? '#00f5ff' : '#64748b'} style={{ flexShrink: 0 }} />
                  {sidebarOpen && (
                    <span style={{
                      fontFamily: 'Rajdhani', fontSize: 15, fontWeight: 600,
                      color: isActive ? '#00f5ff' : '#94a3b8', whiteSpace: 'nowrap'
                    }}>{label}</span>
                  )}
                  {sidebarOpen && isActive && (
                    <ChevronRight size={14} color="#00f5ff" style={{ marginLeft: 'auto' }} />
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '12px', borderTop: '1px solid rgba(0,245,255,0.1)' }}>
          {sidebarOpen && (
            <div style={{ padding: '8px 12px', marginBottom: 8, fontSize: 12, color: '#64748b' }}>
              Logged in as <span style={{ color: '#00f5ff' }}>{user?.username}</span>
            </div>
          )}
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: 10, width: '100%',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 10, padding: '10px 12px', cursor: 'pointer', color: '#f87171'
          }}>
            <LogOut size={18} style={{ flexShrink: 0 }} />
            {sidebarOpen && <span style={{ fontFamily: 'Rajdhani', fontWeight: 600, fontSize: 14 }}>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div style={{
        marginLeft: sidebarOpen ? 260 : 70,
        flex: 1, transition: 'margin-left 0.3s',
        minHeight: '100vh', position: 'relative', zIndex: 1
      }}>
        {/* Top Navbar */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'rgba(5,10,25,0.95)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,245,255,0.1)',
          padding: '0 24px', height: 64,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#00f5ff', padding: 8 }}
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={16} color="#00f5ff" />
            <span style={{ fontFamily: 'Orbitron', fontSize: 12, color: '#00f5ff', letterSpacing: 2 }}>
              ADMIN PANEL
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: 24, minHeight: 'calc(100vh - 64px)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
