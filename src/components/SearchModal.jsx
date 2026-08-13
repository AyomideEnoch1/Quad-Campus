import React, { useState } from 'react';
import { Search, X, ShieldCheck, UserPlus, ArrowRight } from 'lucide-react';

export default function SearchModal({ 
  isOpen, 
  onClose, 
  users, 
  clubs, 
  marketplaceItems,
  onStartChatWithSeller 
}) {
  const [activeTab, setActiveTab] = useState('Top'); // 'Top' | 'Users' | 'Clubs' | 'Marketplace'
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const tabs = ['Top', 'Users', 'Clubs', 'Marketplace'];

  const filteredUsers = users.filter(u => 
    u.displayName.toLowerCase().includes(query.toLowerCase()) || 
    u.username.toLowerCase().includes(query.toLowerCase()) ||
    u.schoolName.toLowerCase().includes(query.toLowerCase())
  );

  const filteredClubs = clubs.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase()) || 
    c.tagline.toLowerCase().includes(query.toLowerCase())
  );

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
        {/* Top Search Input Header */}
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              placeholder="Search students, clubs, textbooks..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="input-styled"
              style={{ paddingLeft: '38px', borderRadius: 'var(--radius-full)' }}
            />
          </div>

          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)', fontSize: '14px', fontWeight: '600' }}
          >
            Cancel
          </button>
        </div>

        {/* Top Sub-Tabs Pill Navigation (Direct reference to UI screen 7/8) */}
        <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)' }}>
          <div className="pill-tab-container">
            {tabs.map(tab => (
              <button
                key={tab}
                className={`pill-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results Display */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Recent Search Tag Chips */}
          {!query && (
            <div>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Trending Searches 🔥
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                {['CS 2026', 'Calculus Textbook', 'Harvard Robotics', 'Dorm Mini-Fridge', 'MIT Hackathon'].map(tag => (
                  <button 
                    key={tag}
                    onClick={() => setQuery(tag)}
                    style={{
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-full)',
                      padding: '6px 12px',
                      fontSize: '12px',
                      color: 'var(--text-main)',
                      cursor: 'pointer'
                    }}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* User Results */}
          {(activeTab === 'Top' || activeTab === 'Users') && (
            <div>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Students ({filteredUsers.length})
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                {filteredUsers.map(user => (
                  <div key={user.uid} style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                      <img src={user.avatarUrl} alt={user.displayName} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {user.displayName}
                          {user.isVerifiedSchool && <ShieldCheck size={12} color="#10B981" />}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>@{user.username} • {user.schoolName}</div>
                      </div>
                    </div>

                    <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '11px' }}>
                      <UserPlus size={12} /> Follow
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Club Results */}
          {(activeTab === 'Top' || activeTab === 'Clubs') && (
            <div>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Clubs ({filteredClubs.length})
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                {filteredClubs.map(club => (
                  <div key={club.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                    <img src={club.logoUrl} alt={club.name} style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '700', fontSize: '13px' }}>{club.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{club.memberCount} members • {club.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
