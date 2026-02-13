import React from "react";
import { Text, TextInput } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useFonts, Jersey20_400Regular } from "@expo-google-fonts/jersey-20";
import { AuthProvider } from "./src/context/AuthContext";
import { UserProvider } from "./src/context/UserContext";
import AppNavigator from "./src/navigation/AppNavigator";

// Force Jersey20 as the default font for ALL Text and TextInput components
if (Text.defaultProps == null) Text.defaultProps = {};
Text.defaultProps.style = { fontFamily: "Jersey20" };

if (TextInput.defaultProps == null) TextInput.defaultProps = {};
TextInput.defaultProps.style = { fontFamily: "Jersey20" };

export default function App() {
  let [fontsLoaded] = useFonts({
    Jersey20: Jersey20_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <UserProvider>
        <AppNavigator />
        <StatusBar style="dark" />
      </UserProvider>
    </AuthProvider>
  );
}