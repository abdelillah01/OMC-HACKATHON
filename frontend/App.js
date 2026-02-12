import React from "react";
import { StatusBar } from "expo-status-bar";
// Importations nécessaires pour les polices
import { useFonts, Jersey20_400Regular } from "@expo-google-fonts/jersey-20";
import { AuthProvider } from "./src/context/AuthContext";
import { UserProvider } from "./src/context/UserContext";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  // Chargement de la police Jersey 20
  let [fontsLoaded] = useFonts({
    Jersey20: Jersey20_400Regular,
  });

  // Si la police n'est pas encore prête, on affiche rien (ou un loader)
  if (!fontsLoaded) {
    return null;
  }

  // Une fois prête, on affiche l'application
  return (
    <AuthProvider>
      <UserProvider>
        <AppNavigator />
        <StatusBar style="light" />
      </UserProvider>
    </AuthProvider>
  );
}
