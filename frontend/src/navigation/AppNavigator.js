import React from "react";
import {
  ActivityIndicator,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import {
  createDrawerNavigator,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import { useAuth } from "../context/AuthContext";
import { useUser } from "../context/UserContext";

// Screens
import WelcomeScreen from "../screens/welcomescreen";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import DashboardScreen from "../screens/DashboardScreen";
import ProgressScreen from "../screens/ProgressScreen";
import FeedbackScreen from "../screens/FeedbackScreen";
import FriendsScreen from "../screens/FriendsScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import HospitalsScreen from "../screens/HospitalsScreen";

const AuthStack = createNativeStackNavigator();
const OnboardStack = createNativeStackNavigator();
const MainTab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// ─── Menu items config ───
const MENU_ITEMS = [
  { label: "Home Page", icon: "", route: "HomeTabs", screen: "Dashboard" },
  { label: "View Progress", icon: "", route: "HomeTabs", screen: "Progress" },
  {
    label: "Today's Plan",
    icon: "",
    route: "HomeTabs",
    screen: "Dashboard",
    params: { openTasks: true },
  },
  { label: "Edit Profile", icon: "", route: "EditProfile" },
  { label: "Leaderboard", icon: "", route: "Friends" },
  { label: "Give Us Your Feedback", icon: "", route: "Feedback" },
  { label: "Nearby Hospitals", icon: "", route: "Hospitals" },
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
          <Image
            source={
              profile?.gender === "female"
                ? require("../assets/avatars/female_avatar.png")
                : require("../assets/avatars/male_avatar.png")
            }
            style={drawerStyles.avatarImage}
          />
        </View>
        <Text style={drawerStyles.profileName}>
          {profile?.name || "Adventurer"}
        </Text>
        <Text style={drawerStyles.profileLevel}>
          Level {profile?.level || 1}
        </Text>
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
        <Text style={[drawerStyles.menuLabel, { color: "#9b1c1c" }]}>
          Log Out
        </Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
}

const drawerStyles = StyleSheet.create({
  scroll: {
    paddingTop: 20,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fff8ec",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#9b1c1c",
    marginBottom: 10,
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    resizeMode: "cover",
  },
  profileName: {
    color: "#283618",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Jersey20",
  },
  profileLevel: {
    color: "#9b1c1c",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
    fontFamily: "Jersey20",
  },
  divider: {
    height: 1,
    backgroundColor: "#c9bda3",
    marginVertical: 12,
    marginHorizontal: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 16,
    width: 28,
    textAlign: "center",
  },
  menuLabel: {
    color: "#283618",
    fontSize: 15,
    fontWeight: "500",
    fontFamily: "Jersey20",
  },
});

// ─── Auth Navigator ───
function AuthNavigator() {
  return (
    <AuthStack.Navigator
      initialRouteName="Welcome"
      screenOptions={{ headerShown: false }}
    >
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
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
          display: "none",
        },
        tabBarActiveTintColor: "#9b1c1c",
        tabBarInactiveTintColor: "#8c7a5e",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          fontFamily: "Jersey20",
        },
      }}
    >
      <MainTab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🏠</Text>
          ),
        }}
      />
      <MainTab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          tabBarLabel: "Progress",
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
        drawerType: "slide",
        overlayColor: "rgba(0,0,0,0.6)",
        drawerStyle: {
          backgroundColor: "#fff8dc",
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
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff8dc",
        }}
      >
        <ActivityIndicator size="large" color="#9b1c1c" />
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
