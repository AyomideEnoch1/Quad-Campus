import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { View } from 'react-native';

import { auth, db } from './src/config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Onboarding screens
import SplashScreen from './src/screens/SplashScreen';
import AuthScreen from './src/screens/AuthScreen';
import InterestsScreen from './src/screens/InterestsScreen';

// Main app screens
import Navbar from './src/components/Navbar';
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

const Tab = createBottomTabNavigator();

// ─── Main Tab Navigator ──────────────────────────────────────────────────────
function MainApp({ currentSchool, setCurrentSchool, currentUser, setCurrentUser }) {
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [items, setItems] = useState(INITIAL_MARKETPLACE);
  const [clubs, setClubs] = useState(INITIAL_CLUBS);
  const [chats, setChats] = useState(INITIAL_CHATS);

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Navbar
        currentSchool={currentSchool}
        onOpenSchoolPicker={() => {
          const nextIndex =
            (SCHOOLS.findIndex(s => s.id === currentSchool.id) + 1) % SCHOOLS.length;
          setCurrentSchool(SCHOOLS[nextIndex]);
        }}
        unreadNotifications={1}
        onOpenSearch={() => alert('Search overlay')}
        onOpenNotifications={() => alert('Notifications list')}
        onOpenVerification={() =>
          setCurrentUser({ ...currentUser, isVerifiedSchool: true })
        }
      />

      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textMuted,
          tabBarStyle: {
            backgroundColor: COLORS.bgCard,
            borderTopColor: COLORS.borderColor,
            height: 60,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarIcon: ({ color }) => {
            const icons = {
              Feed: 'rss',
              Market: 'shopping-bag',
              Chat: 'message-square',
              Clubs: 'users',
              Profile: 'user',
            };
            return <Feather name={icons[route.name]} size={20} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Feed">
          {props => (
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
          {props => (
            <MarketScreen
              {...props}
              items={items}
              setItems={setItems}
              currentUser={currentUser}
              onStartChatWithSeller={(seller, item) =>
                alert(`Start chat with ${seller} about ${item.title}`)
              }
            />
          )}
        </Tab.Screen>

        <Tab.Screen name="Chat">
          {props => (
            <ChatScreen {...props} chats={chats} currentUser={currentUser} />
          )}
        </Tab.Screen>

        <Tab.Screen name="Clubs">
          {props => (
            <ClubsScreen {...props} clubs={clubs} setClubs={setClubs} />
          )}
        </Tab.Screen>

        <Tab.Screen name="Profile">
          {props => (
            <ProfileScreen
              {...props}
              currentUser={currentUser}
              onOpenVerification={() =>
                setCurrentUser({ ...currentUser, isVerifiedSchool: true })
              }
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// ─── Root App — onboarding flow ──────────────────────────────────────────────
export default function App() {
  const [flow, setFlow] = useState('splash'); // 'splash' | 'auth' | 'interests' | 'main'
  const [currentSchool, setCurrentSchool] = useState(SCHOOLS[0]);
  const [currentUser, setCurrentUser] = useState(CURRENT_USER);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setCurrentUser({
              ...CURRENT_USER,
              uid: user.uid,
              email: user.email,
              displayName: data.displayName || user.email.split('@')[0],
              username: data.username || user.email.split('@')[0].toLowerCase(),
              schoolId: data.schoolId || SCHOOLS[0].id,
              schoolName: data.schoolName || SCHOOLS[0].name,
              isVerifiedSchool: !!data.isVerifiedSchool,
            });
            const schoolObj = SCHOOLS.find(s => s.id === data.schoolId);
            if (schoolObj) setCurrentSchool(schoolObj);
          }
        } catch (e) {
          console.warn("Failed to fetch user doc on auth change:", e);
        }
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
      <AuthScreen
        onSignUp={({ selectedSchool }) => {
          if (selectedSchool) setCurrentSchool(selectedSchool);
          setFlow('interests');
        }}
        onLogin={() => setFlow('main')}
      />
    );
  }

  if (flow === 'interests') {
    return <InterestsScreen onContinue={() => setFlow('main')} />;
  }

  return (
    <MainApp
      currentSchool={currentSchool}
      setCurrentSchool={setCurrentSchool}
      currentUser={currentUser}
      setCurrentUser={setCurrentUser}
    />
  );
}
