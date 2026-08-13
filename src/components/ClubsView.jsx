import React, { useState } from 'react';
import { Users, Globe, Plus, Check, ShieldCheck, Calendar, Sparkles } from 'lucide-react';

export default function ClubsView({ 
  clubs, 
  setClubs, 
  currentSchool, 
  currentUser 
}) {
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'inter_school' | 'my_campus'
  const [selectedClubDetail, setSelectedClubDetail] = useState(null);
  const [isCreateClubOpen, setIsCreateClubOpen] = useState(false);

  // New club state
  const [newClubName, setNewClubName] = useState('');
  const [newTagline, setNewTagline] = useState('');
  const [newCategory, setNewCategory] = useState('Technology');
  const [isInterSchool, setIsInterSchool] = useState(true);

  const filteredClubs = clubs.filter(c => {
    if (filterMode === 'inter_school') return c.isInterSchool;
    if (filterMode === 'my_campus') return c.schoolId === currentSchool.id;
    return true;
  });

  const toggleJoinClub = (clubId) => {
    setClubs(clubs.map(c => {
      if (c.id === clubId) {
        const isJoined = !c.isJoined;
        return {
          ...c,
          isJoined,
          memberCount: isJoined ? c.memberCount + 1 : c.memberCount - 1
        };
      }
      return c;
    }));
  };

  const handleCreateClub = (e) => {
    e.preventDefault();
    if (!newClubName) return;

    const newClub = {
      id: 'club_' + Date.now(),
      name: newClubName,
      tagline: newTagline || 'Student organization',
      schoolId: currentUser.schoolId,
      schoolName: currentUser.schoolName,
      isInterSchool,
      category: newCategory,
      memberCount: 1,
      logoUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&fm=jpg&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&fm=jpg&fit=crop&q=80',
      description: 'Official student organization on QUAD.',
      isJoined: true
    };

    setClubs([newClub, ...clubs]);
    setIsCreateClubOpen(false);
    setNewClubName('');
    setNewTagline('');
  };

  return (
    <div className="animate-fade-in" style={{ padding: '16px 12px 24px 12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-display)' }}>
            Clubs & Societies 🏛️
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Discover student orgs across campuses</p>
        </div>

        <button 
          onClick={() => setIsCreateClubOpen(true)}
          className="btn-primary"
          style={{ padding: '8px 14px', fontSize: '12px' }}
        >
          <Plus size={16} />
          <span>New Club</span>
        </button>
      </div>

      {/* Filter Switcher */}
      <div className="pill-tab-container">
        <button 
          className={`pill-tab ${filterMode === 'all' ? 'active' : ''}`}
          onClick={() => setFilterMode('all')}
        >
          All Orgs
        </button>
        <button 
          className={`pill-tab ${filterMode === 'inter_school' ? 'active' : ''}`}
          onClick={() => setFilterMode('inter_school')}
        >
          🌐 Inter-Campus
        </button>
        <button 
          className={`pill-tab ${filterMode === 'my_campus' ? 'active' : ''}`}
          onClick={() => setFilterMode('my_campus')}
        >
          🏫 {currentSchool.shortName}
        </button>
      </div>

      {/* Clubs Directory List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredClubs.map(club => (
          <div 
            key={club.id}
            style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Banner */}
            <div style={{ height: '80px', position: 'relative', background: 'var(--bg-subtle)' }}>
              <img src={club.bannerUrl} alt={club.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {club.isInterSchool && (
                <span style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'rgba(15, 23, 42, 0.85)',
                  backdropFilter: 'blur(4px)',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: '700',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Globe size={10} color="#10B981" /> Inter-School
                </span>
              )}
            </div>

            {/* Club Info */}
            <div style={{ padding: '12px 14px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <img 
                src={club.logoUrl} 
                alt={club.name} 
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: 'var(--radius-md)',
                  objectFit: 'cover',
                  marginTop: '-25px',
                  border: '3px solid white',
                  boxShadow: 'var(--shadow-sm)'
                }} 
              />

              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800', lineHeight: '1.2' }}>{club.name}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{club.tagline}</p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px', fontSize: '11px', color: 'var(--text-light)' }}>
                  <span><Users size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {club.memberCount} members</span>
                  <span>•</span>
                  <span>{club.category}</span>
                </div>
              </div>

              <button 
                onClick={() => toggleJoinClub(club.id)}
                className={club.isJoined ? "btn-secondary" : "btn-primary"}
                style={{ padding: '6px 14px', fontSize: '12px', marginTop: '4px' }}
              >
                {club.isJoined ? (
                  <>
                    <Check size={14} />
                    <span>Joined</span>
                  </>
                ) : (
                  <>
                    <Plus size={14} />
                    <span>Join</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Club Modal */}
      {isCreateClubOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 100,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px'
        }}>
          <form 
            onSubmit={handleCreateClub}
            style={{
              width: '100%',
              maxWidth: '440px',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Register a New Club/Society</h3>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>Club Name</label>
              <input type="text" placeholder="e.g. QUAD AI Research Lab" required value={newClubName} onChange={(e) => setNewClubName(e.target.value)} className="input-styled" />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>Tagline</label>
              <input type="text" placeholder="Short 1-line mission" value={newTagline} onChange={(e) => setNewTagline(e.target.value)} className="input-styled" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="checkbox" id="interSchoolCheck" checked={isInterSchool} onChange={(e) => setIsInterSchool(e.target.checked)} />
              <label htmlFor="interSchoolCheck" style={{ fontSize: '12px', fontWeight: '600' }}>
                Allow students from other schools to join
              </label>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button type="button" onClick={() => setIsCreateClubOpen(false)} className="btn-outline" style={{ flex: 1 }}>Cancel</button>
              <button type="submit" className="btn-primary" style={{ flex: 1 }}>Create Orgs</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
