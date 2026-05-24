// components/Sidebar.jsx - Navigation Sidebar
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, FileText, History,
  BarChart2, LogOut, Zap, ChevronRight
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/generate-bill', label: 'Generate Bill', icon: FileText },
  { path: '/bill-history', label: 'Bill History', icon: History },
  { path: '/reports', label: 'Reports', icon: BarChart2 },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/');
  };

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-64 min-h-screen flex flex-col relative z-10"
      style={{
        background: 'linear-gradient(180deg, rgba(2,8,23,0.98) 0%, rgba(5,15,35,0.98) 100%)',
        borderRight: '1px solid rgba(0,229,255,0.15)',
      }}
    >
      {/* Logo */}
      <div className="p-6 border-b border-cyan-500/10">
        <motion.div
          className="flex items-center gap-3"
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #00e5ff22, #7c3aed22)', border: '1px solid #00e5ff44' }}>
              <Zap size={22} className="text-cyan-400" />
            </div>
            <div className="absolute -inset-1 rounded-xl opacity-30 blur-sm"
              style={{ background: 'linear-gradient(135deg, #00e5ff, #7c3aed)' }} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white" style={{ fontFamily: 'Orbitron, monospace' }}>
              ELECTROBILL
            </h1>
            <p className="text-xs text-cyan-400/60" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              Billing System v1.0
            </p>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="text-xs font-semibold text-cyan-400/40 uppercase tracking-widest px-3 mb-3"
          style={{ fontFamily: 'Rajdhani, sans-serif' }}>
          Main Menu
        </p>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                  isActive ? 'sidebar-active' : 'text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/5'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-cyan-400' : ''} />
                <span className="text-sm font-medium" style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 }}>
                  {item.label}
                </span>
                {isActive && (
                  <ChevronRight size={14} className="ml-auto text-cyan-400" />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-cyan-500/10">
        <div className="glass-card p-3 mb-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-green-400 font-medium">System Online</span>
          </div>
          <p className="text-xs text-slate-500">Admin: admin</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all text-sm font-medium"
          style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 }}
        >
          <LogOut size={16} />
          Logout
        </motion.button>
      </div>
    </motion.aside>
  );
}
