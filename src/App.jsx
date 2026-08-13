import React, { useState } from 'react';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import FeedView from './components/FeedView';
import MarketplaceView from './components/MarketplaceView';
import ChatView from './components/ChatView';
import ClubsView from './components/ClubsView';
import ProfileView from './components/ProfileView';

import SearchModal from './components/SearchModal';
import NotificationsModal from './components/NotificationsModal';
import EduVerificationModal from './components/EduVerificationModal';
import PostModal from './components/PostModal';

import { 
  SCHOOLS, 
  CURRENT_USER, 
  USERS, 
  INITIAL_POSTS, 
  INITIAL_MARKETPLACE, 
  INITIAL_CLUBS, 
  INITIAL_CHATS, 
  INITIAL_NOTIFICATIONS 
} from './data/mockData';

export default function App() {
  const [currentSchool, setCurrentSchool] = useState(SCHOOLS[0]); // Harvard
  const [currentUser, setCurrentUser] = useState(CURRENT_USER);
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'marketplace' | 'chat' | 'clubs' | 'profile'
  
  // Data State
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [marketplaceItems, setMarketplaceItems] = useState(INITIAL_MARKETPLACE);
  const [clubs, setClubs] = useState(INITIAL_CLUBS);
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState(null);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  // Unread badge calculations
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  const unreadChatsCount = chats.reduce((sum, c) => sum + c.unread, 0);

  // Start chat with seller from Marketplace
  const handleStartChatWithSeller = (seller, item) => {
    // Check if chat already exists
    let existingChat = chats.find(c => c.partner.uid === seller.uid);
    if (!existingChat) {
      existingChat = {
        id: 'chat_' + seller.uid,
        type: 'direct',
        partner: seller,
        lastMessage: `Inquiring about ${item.title}`,
        lastMessageTime: 'Just now',
        unread: 0,
        itemContext: item,
        messages: [
          {
            id: 'msg_' + Date.now(),
            senderId: currentUser.uid,
            text: `Hi ${seller.displayName}! Is your "${item.title}" ($${item.price}) still available?`,
            createdAt: 'Just now'
          }
        ]
      };
      setChats([existingChat, ...chats]);
    }

    setActiveChatId(existingChat.id);
    setActiveTab('chat');
  };

  const handleVerifySuccess = () => {
    setCurrentUser({
      ...currentUser,
      isVerifiedSchool: true
    });
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {/* Top Header Navbar */}
      <Navbar 
        currentSchool={currentSchool}
        onSchoolChange={setCurrentSchool}
        schools={SCHOOLS}
        unreadNotifications={unreadNotificationsCount}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenVerification={() => setIsVerificationOpen(true)}
      />

      {/* Main View Container */}
      <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-main)' }}>
        {activeTab === 'feed' && (
          <FeedView 
            posts={posts}
            setPosts={setPosts}
            currentSchool={currentSchool}
            currentUser={currentUser}
            onOpenPostModal={() => setIsPostModalOpen(true)}
          />
        )}

        {activeTab === 'marketplace' && (
          <MarketplaceView 
            items={marketplaceItems}
            setItems={setMarketplaceItems}
            currentUser={currentUser}
            onStartChatWithSeller={handleStartChatWithSeller}
          />
        )}

        {activeTab === 'chat' && (
          <ChatView 
            chats={chats}
            setChats={setChats}
            currentUser={currentUser}
            activeChatId={activeChatId}
            setActiveChatId={setActiveChatId}
          />
        )}

        {activeTab === 'clubs' && (
          <ClubsView 
            clubs={clubs}
            setClubs={setClubs}
            currentSchool={currentSchool}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView 
            currentUser={currentUser}
            userPosts={posts.filter(p => p.authorId === currentUser.uid)}
            userListings={marketplaceItems.filter(i => i.sellerId === currentUser.uid)}
            userClubs={clubs.filter(c => c.isJoined)}
            onOpenVerification={() => setIsVerificationOpen(true)}
          />
        )}
      </main>

      {/* Bottom Mobile Tab Bar */}
      <BottomNav 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadChatsCount={unreadChatsCount}
      />

      {/* Modals & Overlays */}
      <SearchModal 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        users={USERS}
        clubs={clubs}
        marketplaceItems={marketplaceItems}
        onStartChatWithSeller={handleStartChatWithSeller}
      />

      <NotificationsModal 
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllNotificationsRead}
      />

      <EduVerificationModal 
        isOpen={isVerificationOpen}
        onClose={() => setIsVerificationOpen(false)}
        currentUser={currentUser}
        onVerifySuccess={handleVerifySuccess}
      />

      <PostModal 
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        currentUser={currentUser}
        currentSchool={currentSchool}
        onCreatePost={(newPost) => setPosts([newPost, ...posts])}
      />
    </div>
  );
}
