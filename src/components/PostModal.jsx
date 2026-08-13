import React, { useState } from 'react';
import { X, Image, BarChart2, Globe, ShieldCheck, Plus, Trash2 } from 'lucide-react';

export default function PostModal({ isOpen, onClose, currentUser, currentSchool, onCreatePost }) {
  const [content, setContent] = useState('');
  const [scope, setScope] = useState('my_school'); // 'my_school' | 'all_schools'
  const [hasPoll, setHasPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['Option 1', 'Option 2']);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);

  if (!isOpen) return null;

  const sampleImages = [
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() && !selectedImageUrl) return;

    let pollObj = null;
    if (hasPoll && pollQuestion.trim()) {
      pollObj = {
        question: pollQuestion,
        options: pollOptions.filter(o => o.trim()).map((o, idx) => ({
          id: 'opt_' + idx,
          text: o,
          votes: 0
        }))
      };
    }

    const newPost = {
      id: 'post_' + Date.now(),
      authorId: currentUser.uid,
      authorName: currentUser.displayName,
      authorUsername: currentUser.username,
      authorAvatar: currentUser.avatarUrl,
      authorSchoolId: currentUser.schoolId,
      authorSchoolName: currentUser.schoolName,
      isVerifiedAuthor: currentUser.isVerifiedSchool,
      content,
      mediaUrls: selectedImageUrl ? [selectedImageUrl] : [],
      poll: pollObj,
      likesCount: 0,
      repostsCount: 0,
      commentsCount: 0,
      isLiked: false,
      scope,
      createdAt: 'Just now',
      comments: []
    };

    onCreatePost(newPost);
    onClose();
    // Reset state
    setContent('');
    setHasPoll(false);
    setSelectedImageUrl(null);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      zIndex: 110,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <form 
        onSubmit={handleSubmit}
        className="animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src={currentUser.avatarUrl} alt={currentUser.displayName} style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
            <div>
              <div style={{ fontWeight: '700', fontSize: '13px' }}>{currentUser.displayName}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{currentUser.schoolName}</div>
            </div>
          </div>

          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Scope Pill Selector */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            type="button"
            onClick={() => setScope('my_school')}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '12px',
              fontWeight: '600',
              border: scope === 'my_school' ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
              background: scope === 'my_school' ? 'var(--primary-light)' : 'transparent',
              color: scope === 'my_school' ? 'var(--primary)' : 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            🏫 {currentSchool.shortName} Only
          </button>
          <button 
            type="button"
            onClick={() => setScope('all_schools')}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '12px',
              fontWeight: '600',
              border: scope === 'all_schools' ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
              background: scope === 'all_schools' ? 'var(--primary-light)' : 'transparent',
              color: scope === 'all_schools' ? 'var(--primary)' : 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            🌐 All Schools Feed
          </button>
        </div>

        <textarea 
          placeholder="Share campus news, ask a question, or post a poll..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="input-styled"
          style={{ height: '110px', resize: 'none', fontSize: '14px', lineHeight: '1.4' }}
        />

        {/* Selected Image Preview */}
        {selectedImageUrl && (
          <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '140px' }}>
            <img src={selectedImageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button type="button" onClick={() => setSelectedImageUrl(null)} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', padding: '4px', cursor: 'pointer' }}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* Interactive Poll Builder */}
        {hasPoll && (
          <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input 
              type="text" 
              placeholder="Ask a question..."
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
              className="input-styled"
              style={{ fontSize: '13px' }}
            />
            {pollOptions.map((opt, idx) => (
              <input 
                key={idx}
                type="text"
                placeholder={`Option ${idx + 1}`}
                value={opt}
                onChange={(e) => {
                  const updated = [...pollOptions];
                  updated[idx] = e.target.value;
                  setPollOptions(updated);
                }}
                className="input-styled"
                style={{ fontSize: '12px', padding: '8px 12px' }}
              />
            ))}
          </div>
        )}

        {/* Attachments Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              type="button"
              onClick={() => setSelectedImageUrl(sampleImages[Math.floor(Math.random() * sampleImages.length)])}
              style={{ background: 'var(--bg-subtle)', border: 'none', borderRadius: 'var(--radius-full)', padding: '8px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: 'var(--text-main)' }}
            >
              <Image size={16} color="var(--primary)" />
              <span>Attach Image</span>
            </button>

            <button 
              type="button"
              onClick={() => setHasPoll(!hasPoll)}
              style={{ background: 'var(--bg-subtle)', border: 'none', borderRadius: 'var(--radius-full)', padding: '8px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: 'var(--text-main)' }}
            >
              <BarChart2 size={16} color="var(--primary)" />
              <span>{hasPoll ? 'Remove Poll' : 'Add Poll'}</span>
            </button>
          </div>

          <button type="submit" className="btn-primary" style={{ padding: '8px 18px' }}>
            Post 🚀
          </button>
        </div>
      </form>
    </div>
  );
}
