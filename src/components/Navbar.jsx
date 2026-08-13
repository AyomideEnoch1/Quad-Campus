import React from 'react';
import { Search, Bell, ShieldCheck } from 'lucide-react';
import QuadLogo from './QuadLogo';

export default function Navbar({ 
  currentSchool, 
  onSchoolChange, 
  schools, 
  unreadNotifications, 
  onOpenSearch, 
  onOpenNotifications,
  onOpenVerification
}) {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 40,
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-color)',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Brand Logo & School Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <QuadLogo height={26} />

        <select 
          value={currentSchool.id}
          onChange={(e) => {
            const selected = schools.find(s => s.id === e.target.value);
            if (selected) onSchoolChange(selected);
          }}
          style={{
            background: 'var(--bg-input)',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: '600',
            color: 'var(--text-main)',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          {schools.map(s => (
            <option key={s.id} value={s.id}>🏫 {s.shortName}</option>
          ))}
        </select>

        <button 
          onClick={onOpenVerification}
          title="Verified School Email"
          style={{
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            padding: '4px 8px',
            fontSize: '11px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer'
          }}
        >
          <ShieldCheck size={14} color="#10B981" />
          <span style={{ color: '#10B981' }}>.edu</span>
        </button>
      </div>

      {/* Action Icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button 
          onClick={onOpenSearch}
          style={{
            background: 'var(--bg-input)',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-main)',
            transition: 'all 0.2s'
          }}
        >
          <Search size={18} />
        </button>

        <button 
          onClick={onOpenNotifications}
          style={{
            background: 'var(--bg-input)',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-main)',
            position: 'relative',
            transition: 'all 0.2s'
          }}
        >
          <Bell size={18} />
          {unreadNotifications > 0 && (
            <span style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--primary)'
            }} />
          )}
        </button>
      </div>
    </header>
  );
}
