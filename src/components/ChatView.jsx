import React, { useState } from 'react';
import { Send, ArrowLeft, ShieldCheck, CheckCheck, Image, Lock } from 'lucide-react';

export default function ChatView({ 
  chats, 
  setChats, 
  currentUser, 
  activeChatId, 
  setActiveChatId 
}) {
  const [chatType, setChatType] = useState('direct'); // 'direct' | 'club'
  const [inputText, setInputText] = useState('');

  const activeChat = chats.find(c => c.id === activeChatId);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatId) return;

    const newMessage = {
      id: 'msg_' + Date.now(),
      senderId: currentUser.uid,
      text: inputText,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChats(chats.map(c => {
      if (c.id === activeChatId) {
        return {
          ...c,
          lastMessage: inputText,
          lastMessageTime: 'Just now',
          messages: [...c.messages, newMessage]
        };
      }
      return c;
    }));

    setInputText('');
  };

  return (
    <div className="animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Active Conversation Drawer View */}
      {activeChat ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-main)' }}>
          {/* Chat Header */}
          <div style={{
            background: 'var(--bg-card)',
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <button 
              onClick={() => setActiveChatId(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)' }}
            >
              <ArrowLeft size={20} />
            </button>

            <div style={{ position: 'relative' }}>
              <img 
                src={activeChat.partner.avatarUrl} 
                alt={activeChat.partner.displayName}
                style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <span style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#10B981',
                border: '2px solid white'
              }} />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {activeChat.partner.displayName}
                {activeChat.partner.isVerifiedSchool && <ShieldCheck size={12} color="#10B981" />}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {activeChat.partner.schoolName} • Active now
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#10B981', background: 'var(--primary-light)', padding: '4px 8px', borderRadius: 'var(--radius-full)' }}>
              <Lock size={10} /> Encrypted
            </div>
          </div>

          {/* Messages Thread Container */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {/* Attachment preview if item inquiry */}
            {activeChat.itemContext && (
              <div style={{
                background: 'var(--primary-light)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                fontSize: '12px',
                color: 'var(--primary)',
                fontWeight: '600',
                border: '1px solid var(--primary-tint)'
              }}>
                🛒 Inquiring about item: <strong>{activeChat.itemContext.title}</strong> (${activeChat.itemContext.price})
              </div>
            )}

            {activeChat.messages.map(msg => {
              const isUser = msg.senderId === currentUser.uid;

              return (
                <div 
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    alignSelf: isUser ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{
                    background: isUser ? 'var(--primary-gradient)' : 'var(--bg-card)',
                    color: isUser ? 'white' : 'var(--text-main)',
                    borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    padding: '10px 14px',
                    fontSize: '13px',
                    lineHeight: '1.4',
                    boxShadow: 'var(--shadow-sm)',
                    border: isUser ? 'none' : '1px solid var(--border-color)'
                  }}>
                    {msg.text}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--text-light)', marginTop: '3px' }}>
                    <span>{msg.createdAt}</span>
                    {isUser && <CheckCheck size={12} color="var(--primary)" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat Input Footer */}
          <form 
            onSubmit={handleSendMessage}
            style={{
              padding: '12px',
              background: 'var(--bg-card)',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <button type="button" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <Image size={20} />
            </button>

            <input 
              type="text"
              placeholder="Type a message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="input-styled"
              style={{ padding: '10px 14px', fontSize: '13px' }}
            />

            <button 
              type="submit"
              className="btn-primary"
              style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%' }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      ) : (
        /* Conversation List View */
        <div style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-display)' }}>
              Campus Messages 💬
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Real-time 1:1 and Club conversations</p>
          </div>

          {/* Segmented Pill Tabs */}
          <div className="pill-tab-container">
            <button 
              className={`pill-tab ${chatType === 'direct' ? 'active' : ''}`}
              onClick={() => setChatType('direct')}
            >
              Direct Messages
            </button>
            <button 
              className={`pill-tab ${chatType === 'club' ? 'active' : ''}`}
              onClick={() => setChatType('club')}
            >
              Club Groups
            </button>
          </div>

          {/* Chats List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {chats.map(chat => (
              <div 
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ position: 'relative' }}>
                  <img 
                    src={chat.partner.avatarUrl} 
                    alt={chat.partner.displayName}
                    style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <span style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#10B981',
                    border: '2px solid white'
                  }} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '700', fontSize: '14px' }}>{chat.partner.displayName}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>{chat.lastMessageTime}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                    <p style={{
                      fontSize: '12px',
                      color: chat.unread > 0 ? 'var(--text-main)' : 'var(--text-muted)',
                      fontWeight: chat.unread > 0 ? '700' : '400',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '220px'
                    }}>
                      {chat.lastMessage}
                    </p>

                    {chat.unread > 0 && (
                      <span style={{
                        background: 'var(--primary)',
                        color: 'white',
                        fontWeight: '800',
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-full)'
                      }}>
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}
