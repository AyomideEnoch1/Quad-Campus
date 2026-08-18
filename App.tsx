import React, { useState, useEffect } from 'react';
import * as Updates from 'expo-updates';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { Modal } from 'react-native';
import { useSafeAreaInsets, SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { auth, db } from './src/config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Onboarding screens
import SplashScreen from './src/screens/SplashScreen';
import AuthScreen from './src/screens/AuthScreen';
import InterestsScreen from './src/screens/InterestsScreen';
import SetupProfileScreen from './src/screens/SetupProfileScreen';
import { registerForPushNotificationsAsync } from './src/utils/notifications';

// Main app screens
import Navbar from './src/components/Navbar';
import SchoolPickerModal from './src/components/SchoolPickerModal';
import FeedScreen from './src/screens/FeedScreen';
import MarketScreen from './src/screens/MarketScreen';
import ChatScreen from './src/screens/ChatScreen';
import ClubsScreen from './src/screens/ClubsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

import {
  SCHOOLS,
  CURRENT_USER,
  INITIAL_POSTS,
  INITIAL_MARKETPLACE,
  INITIAL_CLUBS,
  INITIAL_CHATS,
} from './src/data/mockData';
import { COLORS } from './src/constants/theme';
import { School, UserProfile, Post, MarketplaceItem, Club, Chat, NotificationItem } from './src/types';

import NotificationsModal from './src/components/NotificationsModal';
import GlobalSearchModal from './src/components/GlobalSearchModal';
import { INITIAL_NOTIFICATIONS, subscribeUserNotifications } from './src/services/notificationService';
import { getOrCreateChat } from './src/services/chatService';

const Tab = createBottomTabNavigator();

interface MainAppProps {
  currentSchool: School;
  setCurrentSchool: (school: School) => void;
  currentUser: UserProfile;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  onSignOut: () => void;
}

function MainApp({ currentSchool, setCurrentSchool, currentUser, setCurrentUser, onSignOut }: MainAppProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 10);

  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [items, setItems] = useState<MarketplaceItem[]>(INITIAL_MARKETPLACE);
  const [clubs, setClubs] = useState<Club[]>(INITIAL_CLUBS);
  const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const [showSchoolPicker, setShowSchoolPicker] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [showProfile, setShowProfile] = useState<boolean>(false);

  useEffect(() => {
    if (!currentUser?.uid) return;
    let seenIds = new Set<string>();

    const unsub = subscribeUserNotifications(currentUser.uid, (liveNotifs) => {
      if (liveNotifs && liveNotifs.length > 0) {
        setNotifications(liveNotifs);

        const brandNew = liveNotifs.find(n => !n.read && !seenIds.has(n.id));
        if (brandNew && seenIds.size > 0) {
          Notifications.scheduleNotificationAsync({
            content: {
              title: brandNew.title,
              body: brandNew.message,
              sound: 'default',
            },
            trigger: null,
          });
        }
        seenIds = new Set(liveNotifs.map(n => n.id));
      }
    });
    return unsub;
  }, [currentUser?.uid]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Navbar
        currentSchool={currentSchool}
        currentUser={currentUser}
        onOpenSchoolPicker={() => setShowSchoolPicker(true)}
        unreadNotifications={unreadCount}
        onOpenSearch={() => setShowSearch(true)}
        onOpenNotifications={() => setShowNotifications(true)}
        onOpenProfile={() => setShowProfile(true)}
        onOpenVerification={() =>
          setCurrentUser({ ...currentUser, isVerifiedSchool: true })
        }
      />

      <SchoolPickerModal
        visible={showSchoolPicker}
        onClose={() => setShowSchoolPicker(false)}
        selectedSchool={currentSchool}
        onSelectSchool={(school: School) => setCurrentSchool(school)}
      />

      <NotificationsModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onMarkAllRead={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
        onClearAll={() => setNotifications([])}
        onToggleRead={(id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))}
      />

      <GlobalSearchModal
        visible={showSearch}
        onClose={() => setShowSearch(false)}
        posts={posts}
        marketplaceItems={items}
        clubs={clubs}
        currentUser={currentUser}
      />

      {/* Full-screen Profile View Modal */}
      <Modal
        visible={showProfile}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowProfile(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bgCard }} edges={['top', 'bottom']}>
          <ProfileScreen
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            onClose={() => setShowProfile(false)}
            onSignOut={() => {
              setShowProfile(false);
              onSignOut();
            }}
            onOpenVerification={() =>
              setCurrentUser({ ...currentUser, isVerifiedSchool: true })
            }
          />
        </SafeAreaView>
      </Modal>

      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textMuted,
          tabBarStyle: {
            backgroundColor: COLORS.bgCard,
            borderTopColor: COLORS.borderColor,
            height: 56 + bottomPadding,
            paddingBottom: bottomPadding,
            paddingTop: 6,
          },
          tabBarIcon: ({ color }) => {
            const icons: Record<string, keyof typeof Feather.glyphMap> = {
              Feed: 'rss',
              Market: 'shopping-bag',
              Chat: 'message-square',
              Clubs: 'users',
            };
            return <Feather name={icons[route.name]} size={20} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Feed">
          {(props: any) => (
            <FeedScreen
              {...props}
              posts={posts}
              setPosts={setPosts}
              currentSchool={currentSchool}
              currentUser={currentUser}
            />
          )}
        </Tab.Screen>

        <Tab.Screen name="Market">
          {(props: any) => (
            <MarketScreen
              {...props}
              items={items}
              setItems={setItems}
              currentUser={currentUser}
              currentSchool={currentSchool}
              onStartChatWithSeller={async (sellerName: string, item: MarketplaceItem) => {
                try {
                  const partner = {
                    uid: item.sellerId || `seller_${item.id}`,
                    displayName: sellerName || item.sellerName || 'Seller',
                    avatarUrl: item.sellerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fm=jpg&fit=crop&q=80'
                  };
                  const chatId = await getOrCreateChat(currentUser, partner);
                  setActiveChat({ id: chatId, partner });
                  props.navigation.navigate('Chat');
                } catch (e) {
                  console.error("Error starting chat with seller:", e);
                }
              }}
            />
          )}
        </Tab.Screen>

        <Tab.Screen name="Chat">
          {(props: any) => (
            <ChatScreen 
              {...props} 
              chats={chats} 
              currentUser={currentUser} 
              activeChat={activeChat}
              onClearActiveChat={() => setActiveChat(null)}
            />
          )}
        </Tab.Screen>

        <Tab.Screen name="Clubs">
          {(props: any) => (
            <ClubsScreen {...props} clubs={clubs} setClubs={setClubs} currentUser={currentUser} currentSchool={currentSchool} />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [flow, setFlow] = useState<'splash' | 'auth' | 'interests' | 'setup_profile' | 'main'>('splash');
  const [currentSchool, setCurrentSchool] = useState<School>(SCHOOLS[0]);
  const [currentUser, setCurrentUser] = useState<UserProfile>(CURRENT_USER);

  useEffect(() => {
    async function checkUpdates() {
      try {
        if (__DEV__) return;
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      } catch (e) {
        // Silently ignore if offline or development
      }
    }
    checkUpdates();
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            const isSuperAdminEmail = user.email?.toLowerCase() === 'ayomidenoch15@gmail.com';
            const userProfile: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              role: isSuperAdminEmail ? 'super_admin' : (data.role || 'student'),
              roles: isSuperAdminEmail ? ['super_admin', 'student'] : (data.roles || ['student']),
              displayName: data.displayName || user.email?.split('@')[0] || 'Student',
              username: data.username || user.email?.split('@')[0].toLowerCase() || 'student',
              schoolId: data.schoolId || SCHOOLS[0].id,
              schoolName: data.schoolName || SCHOOLS[0].name,
              isVerifiedSchool: isSuperAdminEmail ? true : !!data.isVerifiedSchool,
              bio: data.bio || `Student @ ${data.schoolName || 'University'}`,
              major: data.major || 'General Studies',
              gradYear: data.gradYear || 2026,
              avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fm=jpg&fit=crop&q=80',
              bannerUrl: data.bannerUrl || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&fm=jpg&fit=crop&q=80',
              followersCount: data.followersCount || 0,
              followingCount: data.followingCount || 0,
              likesReceived: data.likesReceived || 0,
            };
            setCurrentUser(userProfile);
            registerForPushNotificationsAsync(user.uid);

            const schoolObj = SCHOOLS.find(s => s.id === data.schoolId);
            if (schoolObj) setCurrentSchool(schoolObj);
          }
        } catch (e) {
          console.warn("Failed to fetch user doc on auth change:", e);
        }
      } else {
        setFlow('auth');
      }
    });
    return unsub;
  }, []);

  if (flow === 'splash') {
    return <SplashScreen onDone={() => {
      if (auth.currentUser) {
        setFlow('main');
      } else {
        setFlow('auth');
      }
    }} />;
  }

  if (flow === 'auth') {
    return (
      <SafeAreaProvider>
        <AuthScreen
          onSignUp={({ selectedSchool, user, email }: any) => {
            if (selectedSchool) setCurrentSchool(selectedSchool);
            const handle = email ? email.split('@')[0] : 'student';
            setCurrentUser({
              uid: user?.uid || 'usr_new',
              email: email || '',
              displayName: handle,
              username: handle.toLowerCase(),
              schoolId: selectedSchool?.id || SCHOOLS[0].id,
              schoolName: selectedSchool?.name || SCHOOLS[0].name,
              isVerifiedSchool: false,
              bio: `Student @ ${selectedSchool?.name || 'University'}`,
              major: 'General Studies',
              gradYear: 2026,
              avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fm=jpg&fit=crop&q=80',
              bannerUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&fm=jpg&fit=crop&q=80',
              followersCount: 0,
              followingCount: 0,
              likesReceived: 0,
            });
            setFlow('interests');
          }}
          onLogin={() => setFlow('main')}
        />
      </SafeAreaProvider>
    );
  }

  if (flow === 'interests') {
    return (
      <SafeAreaProvider>
        <InterestsScreen onContinue={() => setFlow('setup_profile')} />
      </SafeAreaProvider>
    );
  }

  if (flow === 'setup_profile') {
    return (
      <SafeAreaProvider>
        <SetupProfileScreen
          currentUser={currentUser}
          onComplete={(updatedData: any) => {
            if (updatedData) {
              setCurrentUser(prev => ({ ...prev, ...updatedData }));
            }
            setFlow('main');
          }}
        />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <MainApp
        currentSchool={currentSchool}
        setCurrentSchool={setCurrentSchool}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        onSignOut={() => setFlow('auth')}
      />
    </SafeAreaProvider>
  );
}
