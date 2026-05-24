// DashboardBackground.jsx - Lightweight CSS background (no WebGL)
import React from 'react';

export default function DashboardBackground() {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      zIndex: 0, pointerEvents: 'none',
      background: 'radial-gradient(ellipse at 20% 50%, rgba(0,128,255,0.05) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(0,245,255,0.04) 0%, transparent 60%)',
    }} />
  );
}
