import React from 'react';
import { Rss, ShoppingBag, MessageSquare, Users, User } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab, unreadChatsCount }) {
  const tabs = [
    { id: 'feed', label: 'Feed', icon: Rss },
    { id: 'marketplace', label: 'Market', icon: ShoppingBag },
    { id: 'chat', label: 'Chat', icon: MessageSquare, badge: unreadChatsCount },
    { id: 'clubs', label: 'Clubs', icon: Users },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <nav style={{
      position: 'sticky',
      bottom: 0,
      zIndex: 40,
      background: 'var(--bg-card)',
      borderTop: '1px solid var(--border-color)',
      padding: '8px 12px 12px 12px',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 -4px 16px rgba(0,0,0,0.03)'
    }}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'transparent',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              cursor: 'pointer',
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              fontSize: '11px',
              fontWeight: isActive ? '700' : '500',
              flex: 1,
              position: 'relative',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              position: 'relative',
              padding: '4px 14px',
              borderRadius: 'var(--radius-full)',
              background: isActive ? 'var(--primary-light)' : 'transparent',
              transition: 'all 0.2s ease'
            }}>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              {tab.badge > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '0px',
                  right: '6px',
                  background: 'var(--primary)',
                  color: 'white',
                  fontSize: '9px',
                  fontWeight: '800',
                  borderRadius: 'var(--radius-full)',
                  padding: '2px 5px',
                  minWidth: '16px',
                  textAlign: 'center'
                }}>
                  {tab.badge}
                </span>
              )}
            </div>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
