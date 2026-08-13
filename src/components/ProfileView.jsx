import React, { useState } from 'react';
import { ShieldCheck, Edit3, Share2, Grid, List, Bookmark, Settings, Award } from 'lucide-react';

export default function ProfileView({ 
  currentUser, 
  userPosts, 
  userListings, 
  userClubs, 
  onOpenVerification 
}) {
  const [activeProfileTab, setActiveProfileTab] = useState('posts'); // 'posts' | 'listings' | 'clubs'

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '24px' }}>
      
      {/* Banner */}
      <div style={{ position: 'relative', height: '140px', background: 'var(--bg-subtle)' }}>
        <img 
          src={currentUser.bannerUrl} 
          alt="Banner"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <button style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}>
          <Share2 size={16} />
        </button>
      </div>

      {/* Main Profile Info Card (Inspired by reference UI profile layout) */}
      <div style={{
        padding: '0 16px',
        marginTop: '-45px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        {/* Avatar with Verified Ring */}
        <div style={{ position: 'relative', marginBottom: '10px' }}>
          <img 
            src={currentUser.avatarUrl} 
            alt={currentUser.displayName}
            style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '4px solid var(--bg-card)',
              boxShadow: 'var(--shadow-md)'
            }}
          />
          {currentUser.isVerifiedSchool && (
            <div style={{
              position: 'absolute',
              bottom: '4px',
              right: '4px',
              background: '#10B981',
              color: 'white',
              borderRadius: '50%',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white'
            }} title="Official .edu Verified Student">
              <ShieldCheck size={14} />
            </div>
          )}
        </div>

        {/* User Identity */}
        <h1 style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-display)' }}>
          {currentUser.displayName}
        </h1>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
          @{currentUser.username}
        </p>

        {/* School Tag Pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--primary-light)',
          color: 'var(--primary)',
          fontWeight: '700',
          fontSize: '12px',
          padding: '4px 12px',
          borderRadius: 'var(--radius-full)',
          marginTop: '8px'
        }}>
          <span>🏫 {currentUser.schoolName}</span>
          <span>•</span>
          <span>{currentUser.gradYear}</span>
        </div>

        {/* Bio */}
        <p style={{ fontSize: '13px', lineHeight: '1.4', color: 'var(--text-main)', marginTop: '10px', maxWidth: '360px' }}>
          {currentUser.bio}
        </p>

        {/* Stats Row Bar (Direct reference to UI stats line: Followers / Following / Likes) */}
        <div style={{
          width: '100%',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          padding: '14px 12px',
          marginTop: '16px',
          display: 'flex',
          justifyContent: 'space-around',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)' }}>
              {currentUser.followersCount}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Followers</div>
          </div>
          <div style={{ width: '1px', background: 'var(--border-color)' }} />
          <div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)' }}>
              {currentUser.followingCount}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Following</div>
          </div>
          <div style={{ width: '1px', background: 'var(--border-color)' }} />
          <div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--primary)' }}>
              {(currentUser.likesReceived / 1000).toFixed(1)}k
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Likes</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '14px' }}>
          <button className="btn-primary" style={{ flex: 1, padding: '10px' }}>
            <Edit3 size={14} />
            <span>Edit Profile</span>
          </button>

          {!currentUser.isVerifiedSchool && (
            <button 
              onClick={onOpenVerification}
              className="btn-secondary" 
              style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white' }}
            >
              <ShieldCheck size={14} />
              <span>Verify .edu</span>
            </button>
          )}
        </div>
      </div>

      {/* Activity Sub-Tabs Switcher */}
      <div style={{ padding: '0 16px', marginTop: '20px' }}>
        <div className="pill-tab-container">
          <button 
            className={`pill-tab ${activeProfileTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveProfileTab('posts')}
          >
            My Posts ({userPosts.length})
          </button>
          <button 
            className={`pill-tab ${activeProfileTab === 'listings' ? 'active' : ''}`}
            onClick={() => setActiveProfileTab('listings')}
          >
            Listings ({userListings.length})
          </button>
          <button 
            className={`pill-tab ${activeProfileTab === 'clubs' ? 'active' : ''}`}
            onClick={() => setActiveProfileTab('clubs')}
          >
            Clubs ({userClubs.length})
          </button>
        </div>
      </div>

      {/* Sub-Tab Content Rendering */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {activeProfileTab === 'posts' && (
          userPosts.map(post => (
            <div key={post.id} style={{ background: 'var(--bg-card)', padding: '12px 14px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-main)' }}>{post.content}</p>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                ❤️ {post.likesCount} Likes • 💬 {post.commentsCount} Comments
              </div>
            </div>
          ))
        )}

        {activeProfileTab === 'listings' && (
          userListings.map(item => (
            <div key={item.id} style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <img src={item.imageUrl} alt={item.title} style={{ width: '50px', height: '50px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
              <div>
                <div style={{ fontWeight: '700', fontSize: '13px' }}>{item.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '700' }}>${item.price.toFixed(2)}</div>
              </div>
            </div>
          ))
        )}

        {activeProfileTab === 'clubs' && (
          userClubs.map(club => (
            <div key={club.id} style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <img src={club.logoUrl} alt={club.name} style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
              <div>
                <div style={{ fontWeight: '700', fontSize: '13px' }}>{club.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{club.category}</div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
