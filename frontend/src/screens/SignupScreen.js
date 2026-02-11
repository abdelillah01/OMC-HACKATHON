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

export default function SignupScreen({ navigation }) {
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    // CORRECTION : On vérifie 'name' et non 'email' car c'est ce que l'utilisateur remplit
    if (!name.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      // On génère un email fictif si ton backend en a absolument besoin,
      // ou on passe le name si ton signUp l'accepte.
      const fakeEmail = `${name.trim().replace(/\s+/g, "")}@vitalis.com`;
      await signUp(fakeEmail, password, name.trim());

      // Si l'inscription réussit, AuthContext changera l'état et AppNavigator
      // te redirigera automatiquement vers le Home.
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour mettre à jour le texte et effacer l'erreur en même temps
  const handleTextChange = (setter, value) => {
    setter(value);
    if (error) setError("");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.inner}>
        <View style={styles.imageContainer}>
          <Image
            source={require("../../assets/trainer.png")}
            style={styles.trainerImage}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Welcome to Vitalis</Text>
        <Text style={styles.subtitle}>Create your new account</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* Input Username */}
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
            value={name}
            onChangeText={(val) => handleTextChange(setName, val)}
            autoCapitalize="none"
          />
        </View>

        {/* Input Password */}
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
            onChangeText={(val) => handleTextChange(setPassword, val)}
            secureTextEntry
          />
          <Ionicons
            name="eye-outline"
            size={20}
            color="#666"
            style={styles.eyeIcon}
          />
        </View>

        {/* Input Confirm Password */}
        <View style={styles.inputWrapper}>
          <Ionicons
            name="lock-closed"
            size={20}
            color="#666"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm your password"
            placeholderTextColor="#888"
            value={confirmPassword}
            onChangeText={(val) => handleTextChange(setConfirmPassword, val)}
            secureTextEntry
          />
          <Ionicons
            name="eye-outline"
            size={20}
            color="#666"
            style={styles.eyeIcon}
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign in</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.link}>
            Already have an account ?{" "}
            <Text style={styles.linkBold}>Log in</Text>
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
    justifyContent: "flex-start",
    paddingHorizontal: 30,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 5,
    marginTop: 90,
    marginLeft: 30, // Un peu réduit pour laisser de la place
  },
  trainerImage: {
    width: 234,
    height: 265,
  },
  title: {
    fontSize: 36,
    color: "#283618",
    textAlign: "center",
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
    marginBottom: 12,
    paddingHorizontal: 15,
    height: 65,
    width: 317,
    alignSelf: "center",
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
  button: {
    backgroundColor: "#283618",
    borderRadius: 30,
    padding: 16,
    alignItems: "center",
    marginTop: 15,
    marginBottom: 15,
    height: 65,
    width: 317,
    alignSelf: "center",
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
