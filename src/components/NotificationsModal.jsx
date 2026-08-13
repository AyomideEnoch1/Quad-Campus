import React from 'react';
import { Bell, Heart, MessageSquare, ShieldCheck, X } from 'lucide-react';

export default function NotificationsModal({ isOpen, onClose, notifications, onMarkAllRead }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      zIndex: 100,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start'
    }}>
      <div className="animate-slide-up" style={{
        width: '100%',
        maxWidth: '480px',
        height: '100%',
        background: 'var(--bg-card)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Notifications</h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={onMarkAllRead} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
              Mark all read
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {notifications.map(n => (
            <div 
              key={n.id}
              style={{
                background: n.read ? 'var(--bg-card)' : 'var(--primary-light)',
                borderRadius: 'var(--radius-lg)',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                border: '1px solid var(--border-color)'
              }}
            >
              <div style={{
                background: 'var(--bg-card)',
                padding: '8px',
                borderRadius: '50%',
                boxShadow: 'var(--shadow-sm)'
              }}>
                {n.type === 'like' && <Heart size={16} color="var(--primary)" fill="var(--primary)" />}
                {n.type === 'message' && <MessageSquare size={16} color="#3B82F6" />}
                {n.type === 'verification' && <ShieldCheck size={16} color="#10B981" />}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', fontSize: '13px' }}>{n.title}</div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{n.body}</p>
                <span style={{ fontSize: '10px', color: 'var(--text-light)', marginTop: '4px', display: 'block' }}>{n.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
