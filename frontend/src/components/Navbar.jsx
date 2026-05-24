// components/Navbar.jsx - Top Navigation Bar
import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Search, Zap, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const pageTitles = {
  '/dashboard': { title: 'Dashboard', sub: 'Overview & Statistics' },
  '/customers': { title: 'Customer Management', sub: 'Manage all customers' },
  '/generate-bill': { title: 'Generate Bill', sub: 'Create new electricity bill' },
  '/bill-history': { title: 'Bill History', sub: 'All generated bills' },
  '/reports': { title: 'Reports & Analytics', sub: 'Charts and insights' },
};

export default function Navbar() {
  const location = useLocation();
  const page = pageTitles[location.pathname] || { title: 'ElectroBill', sub: '' };

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="h-16 flex items-center justify-between px-6 relative z-10"
      style={{
        background: 'rgba(2,8,23,0.95)',
        borderBottom: '1px solid rgba(0,229,255,0.12)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Page Title */}
      <div>
        <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.9rem' }}>
          {page.title}
        </h2>
        <p className="text-xs text-cyan-400/50">{page.sub}</p>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* Live indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)' }}>
          <motion.div
            className="w-2 h-2 bg-cyan-400 rounded-full"
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-xs text-cyan-400 font-medium" style={{ fontFamily: 'Rajdhani, sans-serif' }}>LIVE</span>
          <Zap size={12} className="text-cyan-400" />
        </div>

        {/* Notification bell */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-cyan-400 transition-colors"
          style={{ background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.1)' }}
        >
          <Bell size={16} />
        </motion.button>

        {/* Admin avatar */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.1)' }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #00e5ff33, #7c3aed33)' }}>
            <User size={14} className="text-cyan-400" />
          </div>
          <span className="text-sm text-slate-300" style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 }}>
            Admin
          </span>
        </div>
      </div>
    </motion.header>
  );
}
