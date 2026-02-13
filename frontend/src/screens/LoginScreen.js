import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen({ navigation }) {
  const { logIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      // If user typed a username (no @), convert to the fake email used at signup
      const loginEmail = email.trim().includes("@")
        ? email.trim()
        : `${email.trim().replace(/\s+/g, "")}@vitalis.com`;
      await logIn(loginEmail, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.inner}>
        {/* IMAGE DU CHEVALIER AGRANDIE ET DECALEE */}
        <View style={styles.imageContainer}>
          <Image
            source={require("../../assets/knight.png")}
            style={styles.knightImage}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Welcome back !</Text>
        <Text style={styles.subtitle}>Log in to your account</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.inputWrapper}>
          <Ionicons
            name="person"
            size={20}
            color="#666"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter your username"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons
            name="lock-closed"
            size={20}
            color="#666"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Ionicons
            name="eye-outline"
            size={20}
            color="#666"
            style={styles.eyeIcon}
          />
        </View>

        <View style={styles.rememberRow}>
          <Ionicons name="checkmark-circle" size={18} color="#4a5d23" />
          <Text style={styles.rememberText}> Remember me</Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Log in</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
          <Text style={styles.link}>
            Don't have an account ? <Text style={styles.linkBold}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
    marginTop: -10,
  },
  imageContainer: {
    alignItems: "center", // Centre horizontalement le conteneur
    marginBottom: 5,
  },
  knightImage: {
    width: 422,
    height: 289,
    marginLeft: 135,
  },
  title: {
    fontSize: 34,
    color: "#283618",
    textAlign: "center",
    marginBottom: 4,
    fontFamily: "Jersey20",
  },
  subtitle: {
    fontSize: 16,
    color: "#99a",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "Jersey20",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f1e8",
    borderRadius: 15,
    marginBottom: 16,
    paddingHorizontal: 15,
    height: 55,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#333",
    fontSize: 18,
    fontFamily: "Jersey20",
  },
  eyeIcon: {
    marginLeft: 10,
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
    marginLeft: 5,
  },
  rememberText: {
    color: "#99a",
    fontSize: 14,
    fontFamily: "Jersey20",
  },
  button: {
    backgroundColor: "#283618",
    borderRadius: 30,
    padding: 15,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 24,
    fontFamily: "Jersey20",
  },
  link: {
    color: "#99a",
    textAlign: "center",
    fontSize: 16,
    fontFamily: "Jersey20",
  },
  linkBold: {
    color: "#283618",
    textDecorationLine: "underline",
  },
  error: {
    color: "#e94560",
    textAlign: "center",
    marginBottom: 10,
    fontFamily: "Jersey20",
  },
});
