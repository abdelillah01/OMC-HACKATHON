import React from 'react';
import { ActivityIndicator, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';

// Screens
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ProgressScreen from '../screens/ProgressScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import FriendsScreen from '../screens/FriendsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import HospitalsScreen from '../screens/HospitalsScreen';

const AuthStack = createNativeStackNavigator();
const OnboardStack = createNativeStackNavigator();
const MainTab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// ─── Menu items config ───
const MENU_ITEMS = [
  { label: 'Home Page', icon: '🏠', route: 'HomeTabs', screen: 'Dashboard' },
  { label: 'Daily Habit', icon: '⚡', route: 'HomeTabs', screen: 'Progress' },
  { label: 'Today\'s Plan', icon: '📝', route: 'HomeTabs', screen: 'Dashboard', params: { openTasks: true } },
  { label: 'Edit Profile', icon: '✏️', route: 'EditProfile' },
  { label: 'See Your Friends', icon: '👥', route: 'Friends' },
  { label: 'Give Us Your Feedback', icon: '💬', route: 'Feedback' },
  { label: 'Nearby Hospitals', icon: '🏥', route: 'Hospitals' },
];

// ─── Custom Drawer Content ───
function CustomDrawerContent(props) {
  const { profile } = useUser();
  const { logOut } = useAuth();
  const { navigation } = props;

  const handlePress = (item) => {
    if (item.screen) {
      navigation.navigate(item.route, {
        screen: item.screen,
        params: item.params,
      });
    } else {
      navigation.navigate(item.route);
    }
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={drawerStyles.scroll}
    >
      {/* Profile header */}
      <View style={drawerStyles.profileSection}>
        <View style={drawerStyles.avatarCircle}>
          <Text style={drawerStyles.avatarEmoji}>🧑</Text>
        </View>
        <Text style={drawerStyles.profileName}>{profile?.name || 'Adventurer'}</Text>
        <Text style={drawerStyles.profileLevel}>Level {profile?.level || 1}</Text>
      </View>

      <View style={drawerStyles.divider} />

      {/* Menu items */}
      {MENU_ITEMS.map((item) => (
        <TouchableOpacity
          key={item.label}
          activeOpacity={0.6}
          style={drawerStyles.menuItem}
          onPress={() => handlePress(item)}
        >
          <Text style={drawerStyles.menuIcon}>{item.icon}</Text>
          <Text style={drawerStyles.menuLabel}>{item.label}</Text>
        </TouchableOpacity>
      ))}

      <View style={drawerStyles.divider} />

      {/* Logout */}
      <TouchableOpacity
        activeOpacity={0.6}
        style={drawerStyles.menuItem}
        onPress={logOut}
      >
        <Text style={drawerStyles.menuIcon}>🚪</Text>
        <Text style={[drawerStyles.menuLabel, { color: '#e94560' }]}>Log Out</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
}

const drawerStyles = StyleSheet.create({
  scroll: {
    paddingTop: 20,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#16213e',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e94560',
    marginBottom: 10,
  },
  avatarEmoji: {
    fontSize: 30,
  },
  profileName: {
    color: '#eaeaea',
    fontSize: 18,
    fontWeight: '700',
  },
  profileLevel: {
    color: '#e94560',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#0f3460',
    marginVertical: 12,
    marginHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 16,
    width: 28,
    textAlign: 'center',
  },
  menuLabel: {
    color: '#eaeaea',
    fontSize: 15,
    fontWeight: '500',
  },
});

// ─── Auth Navigator ───
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
}

// ─── Onboarding Navigator ───
function OnboardingNavigator() {
  return (
    <OnboardStack.Navigator screenOptions={{ headerShown: false }}>
      <OnboardStack.Screen name="Onboarding" component={OnboardingScreen} />
    </OnboardStack.Navigator>
  );
}

// ─── Main Tabs (Home + Progress) ───
function MainTabNavigator() {
  return (
    <MainTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#16213e',
          borderTopColor: '#0f3460',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#e94560',
        tabBarInactiveTintColor: '#888',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <MainTab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🏠</Text>
          ),
        }}
      />
      <MainTab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          tabBarLabel: 'Progress',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📊</Text>
          ),
        }}
      />
    </MainTab.Navigator>
  );
}

// ─── Drawer Navigator (wraps everything) ───
function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        overlayColor: 'rgba(0,0,0,0.6)',
        drawerStyle: {
          backgroundColor: '#1a1a2e',
          width: 280,
        },
      }}
    >
      <Drawer.Screen name="HomeTabs" component={MainTabNavigator} />
      <Drawer.Screen name="Feedback" component={FeedbackScreen} />
      <Drawer.Screen name="Friends" component={FriendsScreen} />
      <Drawer.Screen name="EditProfile" component={EditProfileScreen} />
      <Drawer.Screen name="Hospitals" component={HospitalsScreen} />
    </Drawer.Navigator>
  );
}

// ─── Root Navigator ───
export default function AppNavigator() {
  const { user, loading } = useAuth();
  const { profile, profileLoading } = useUser();

  if (loading || (user && profileLoading)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' }}>
        <ActivityIndicator size="large" color="#e94560" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!user ? (
        <AuthNavigator />
      ) : !profile?.onboardingComplete ? (
        <OnboardingNavigator />
      ) : (
        <DrawerNavigator />
      )}
    </NavigationContainer>
  );
}
