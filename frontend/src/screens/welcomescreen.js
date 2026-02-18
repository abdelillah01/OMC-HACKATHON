import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
  Dimensions,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen({ navigation }) {
  return (
    <ImageBackground
      source={require("../assets/sky-background.png")}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Titre avec gap entre les lignes */}
      <View style={styles.titleContainer}>
        <Text style={styles.pixelTitle}>welcome</Text>
        <Text style={styles.pixelTitle}>to</Text>
        <Text style={styles.pixelTitle}>vitalis</Text>
      </View>

      {/* Boutons avec effet Pixel Art 3D et bords arrondis */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.pixelButtonShadow}
          activeOpacity={0.9}
          onPress={() => navigation.navigate("Login")}
        >
          <View style={styles.buttonInner}>
            <Text style={styles.buttonText}>Log in</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.pixelButtonShadow}
          activeOpacity={0.9}
          onPress={() => navigation.navigate("Signup")}
        >
          <View style={styles.buttonInner}>
            <Text style={styles.buttonText}>Sign up</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Personnage sur l'herbe avec dimensions 200 */}
      <View style={styles.characterContainer}>
        <Image
          source={require("../assets/avatars/avatar_welcome.png")}
          style={styles.character}
          resizeMode="contain"
        />
      </View>

      {/* Slogan sans fond ni barre noire */}
      <View style={styles.bottomSection}>
        <Text style={styles.sloganText}>Reset the Routine.</Text>
        <Text style={styles.sloganText}>Begin the Journey</Text>
      </View>

      {/* Footer épuré */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>©FlowStack</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  titleContainer: {
    marginTop: height * 0.08,
    gap: 10, // Ajoute de l'espace entre welcome, to et vitalis
  },
  pixelTitle: {
    fontFamily: "PressStart2P",
    fontSize: 40,
    color: "#000",
    textAlign: "center",
    textTransform: "lowercase",
    lineHeight: 40,
  },
  buttonsContainer: {
    marginTop: height * 0.05,
    gap: 30,
    alignItems: "center",
  },
  /* Correction des boutons : Effet Pilule 3D de l'image */
  pixelButtonShadow: {
    width: width * 0.65,
    height: 62,
    backgroundColor: "#3a4528", // Bordure sombre extérieure
    borderRadius: 35, // Forme arrondie comme sur la photo
    paddingBottom: 6, // Épaisseur de l'ombre en bas
  },
  buttonInner: {
    flex: 1,
    backgroundColor: "#617143", // Couleur principale olive
    borderRadius: 30,
    borderWidth: 3,
    borderColor: "#8a9b6a", // Liseré clair interne pour l'effet relief
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontFamily: "Jersey20",
    fontSize: 28,
    color: "#FFF",
    fontWeight: "bold",
  },
  characterContainer: {
    position: "absolute",
    bottom: height * 0.18, // Ajusté pour poser les pieds exactement sur l'herbe
    width: "100%",
    alignItems: "center",
  },
  character: {
    width: 200,
    height: 200,
  },
  bottomSection: {
    position: "absolute",
    bottom: height * 0.06,
    alignItems: "center",
    width: "100%",
  },
  sloganText: {
    fontFamily: "Jersey20",
    fontSize: 32,
    color: "#000",
    textAlign: "center",
    lineHeight: 38,
  },
  footer: {
    position: "absolute",
    bottom: 15,
  },
  footerText: {
    fontFamily: "Jersey20",
    fontSize: 14,
    color: "#000",
  },
});
