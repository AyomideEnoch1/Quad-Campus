import React, { useState } from 'react';
import { Heart, MessageCircle, Repeat2, Share2, ShieldCheck, Image, BarChart2, Send } from 'lucide-react';

export default function FeedView({ 
  posts, 
  setPosts, 
  currentSchool, 
  currentUser, 
  onOpenPostModal 
}) {
  const [feedScope, setFeedScope] = useState('my_school'); // 'my_school' | 'all_schools'
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentText, setCommentText] = useState('');

  // Filter posts based on scope
  const filteredPosts = posts.filter(post => {
    if (feedScope === 'my_school') {
      return post.authorSchoolId === currentSchool.id;
    }
    return true; // all_schools
  });

  const handleLike = (postId) => {
    setPosts(posts.map(p => {
      if (p.id === postId) {
        const isLiked = !p.isLiked;
        return {
          ...p,
          isLiked,
          likesCount: isLiked ? p.likesCount + 1 : p.likesCount - 1
        };
      }
      return p;
    }));
  };

  const handleVote = (postId, optionId) => {
    setPosts(posts.map(p => {
      if (p.id === postId && p.poll && !p.poll.userVotedOption) {
        const updatedOptions = p.poll.options.map(opt => 
          opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
        );
        return {
          ...p,
          poll: {
            ...p.poll,
            options: updatedOptions,
            userVotedOption: optionId
          }
        };
      }
      return p;
    }));
  };

  const handleAddComment = (postId) => {
    if (!commentText.trim()) return;
    setPosts(posts.map(p => {
      if (p.id === postId) {
        const newComment = {
          id: 'c_' + Date.now(),
          authorName: currentUser.displayName,
          text: commentText,
          createdAt: 'Just now'
        };
        return {
          ...p,
          commentsCount: p.commentsCount + 1,
          comments: [...(p.comments || []), newComment]
        };
      }
      return p;
    }));
    setCommentText('');
  };

  return (
    <div className="animate-fade-in" style={{ padding: '16px 12px 24px 12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Scope Switcher Pill Bar (Inspired by reference UI top tabs) */}
      <div className="pill-tab-container">
        <button 
          className={`pill-tab ${feedScope === 'my_school' ? 'active' : ''}`}
          onClick={() => setFeedScope('my_school')}
        >
          🏫 My School ({currentSchool.shortName})
        </button>
        <button 
          className={`pill-tab ${feedScope === 'all_schools' ? 'active' : ''}`}
          onClick={() => setFeedScope('all_schools')}
        >
          🌐 All Campuses
        </button>
      </div>

      {/* Compose Quick Card */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        padding: '14px 16px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        border: '1px solid var(--border-color)'
      }}>
        <img 
          src={currentUser.avatarUrl} 
          alt={currentUser.displayName}
          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
        />
        <button 
          onClick={onOpenPostModal}
          style={{
            flex: 1,
            background: 'var(--bg-input)',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            padding: '10px 16px',
            textAlign: 'left',
            color: 'var(--text-muted)',
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          What's happening on campus?
        </button>
        <button 
          onClick={onOpenPostModal}
          style={{
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <Image size={18} />
        </button>
      </div>

      {/* Feed Posts List */}
      {filteredPosts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          <p style={{ fontWeight: '600', fontSize: '15px' }}>No posts in {currentSchool.shortName} yet!</p>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>Be the first student to post on campus or switch to "All Campuses".</p>
        </div>
      ) : (
        filteredPosts.map(post => {
          const totalPollVotes = post.poll 
            ? post.poll.options.reduce((sum, opt) => sum + opt.votes, 0) 
            : 0;

          return (
            <article 
              key={post.id}
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-xl)',
                padding: '16px',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              {/* Author Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img 
                    src={post.authorAvatar} 
                    alt={post.authorName}
                    style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: '700', fontSize: '14px' }}>{post.authorName}</span>
                      {post.isVerifiedAuthor && (
                        <span className="verified-badge">
                          <ShieldCheck size={10} /> .edu
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <span>@{post.authorUsername}</span>
                      <span>•</span>
                      <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{post.authorSchoolName}</span>
                    </div>
                  </div>
                </div>

                <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>{post.createdAt}</span>
              </div>

              {/* Text Body */}
              <p style={{ fontSize: '14px', lineHeight: '1.5', color: 'var(--text-main)' }}>
                {post.content}
              </p>

              {/* Media Image */}
              {post.mediaUrls && post.mediaUrls.length > 0 && (
                <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', maxHeight: '280px' }}>
                  <img 
                    src={post.mediaUrls[0]} 
                    alt="Post media"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}

              {/* Interactive Poll */}
              {post.poll && (
                <div style={{
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700' }}>
                    <BarChart2 size={16} color="var(--primary)" />
                    <span>{post.poll.question}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                    {post.poll.options.map(opt => {
                      const pct = totalPollVotes > 0 ? Math.round((opt.votes / totalPollVotes) * 100) : 0;
                      const isVoted = post.poll.userVotedOption === opt.id;

                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleVote(post.id, opt.id)}
                          disabled={!!post.poll.userVotedOption}
                          style={{
                            position: 'relative',
                            overflow: 'hidden',
                            border: isVoted ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                            padding: '8px 12px',
                            background: 'var(--bg-card)',
                            textAlign: 'left',
                            cursor: post.poll.userVotedOption ? 'default' : 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '13px',
                            fontWeight: isVoted ? '700' : '500'
                          }}
                        >
                          {post.poll.userVotedOption && (
                            <div style={{
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              bottom: 0,
                              width: `${pct}%`,
                              background: 'var(--primary-light)',
                              zIndex: 0,
                              transition: 'width 0.4s ease'
                            }} />
                          )}
                          <span style={{ position: 'relative', zIndex: 1 }}>{opt.text}</span>
                          {post.poll.userVotedOption && (
                            <span style={{ position: 'relative', zIndex: 1, fontWeight: '700', color: 'var(--primary)' }}>
                              {pct}%
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'right' }}>
                    {totalPollVotes} votes
                  </span>
                </div>
              )}

              {/* Action Bar (Likes, Comments, Reposts) */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '8px',
                borderTop: '1px solid var(--border-color)',
                marginTop: '4px'
              }}>
                {/* Like Button */}
                <button
                  onClick={() => handleLike(post.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: post.isLiked ? 'var(--primary)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}
                >
                  <Heart 
                    size={18} 
                    fill={post.isLiked ? 'var(--primary)' : 'none'} 
                    className={post.isLiked ? 'animate-pulse-heart' : ''} 
                  />
                  <span>{post.likesCount}</span>
                </button>

                {/* Comment Button */}
                <button
                  onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}
                >
                  <MessageCircle size={18} />
                  <span>{post.commentsCount}</span>
                </button>

                {/* Repost Button */}
                <button
                  style={{
                    background: 'transparent',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}
                >
                  <Repeat2 size={18} />
                  <span>{post.repostsCount}</span>
                </button>

                <button
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  <Share2 size={18} />
                </button>
              </div>

              {/* Collapsible Comments Drawer */}
              {activeCommentPostId === post.id && (
                <div style={{
                  marginTop: '8px',
                  paddingTop: '12px',
                  borderTop: '1px dashed var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  {/* Comments list */}
                  {post.comments && post.comments.map(c => (
                    <div key={c.id} style={{ background: 'var(--bg-subtle)', padding: '8px 12px', borderRadius: 'var(--radius-md)', fontSize: '12px' }}>
                      <span style={{ fontWeight: '700', marginRight: '6px' }}>{c.authorName}:</span>
                      <span>{c.text}</span>
                    </div>
                  ))}

                  {/* Add comment input */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text"
                      placeholder="Write a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                      className="input-styled"
                      style={{ padding: '8px 12px', fontSize: '12px' }}
                    />
                    <button 
                      onClick={() => handleAddComment(post.id)}
                      className="btn-primary" 
                      style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)' }}
                    >
                      <Send size={14} />
                    </button>
                  </div>
                </div>
              )}

            </article>
          );
        })
      )}

    </div>
  );
}
