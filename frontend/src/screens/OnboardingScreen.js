import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  ImageBackground,
  Dimensions,
} from "react-native";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";

const { height } = Dimensions.get("window");

export default function OnboardingScreen() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [gender, setGender] = useState(null);
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (step === 0 && !gender) return;
    if (step === 1 && !goal) return;
    if (step === 1) handleFinish();
    else setStep(step + 1);
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        gender,
        healthGoal: goal,
        onboardingComplete: true,
      });
    } catch (err) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── ÉCRAN 1: GENDER SELECTION (Gardé tel quel) ───
  if (step === 0) {
    return (
      <View style={styles.whiteContainer}>
        <View style={styles.content}>
          <Text style={styles.pixelTitle}>
            Which gender do you{"\n"}identify as?
          </Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              onPress={() => setGender("male")}
              style={styles.genderItem}
            >
              <View
                style={[
                  styles.avatarCircle,
                  gender === "male" && styles.avatarSelected,
                ]}
              >
                <Image
                  source={require("../../assets/male_avatar.png")}
                  style={styles.avatarImg}
                />
              </View>
              <Text style={styles.genderText}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setGender("female")}
              style={styles.genderItem}
            >
              <View
                style={[
                  styles.avatarCircle,
                  gender === "female" && styles.avatarSelected,
                ]}
              >
                <Image
                  source={require("../../assets/female_avatar.png")}
                  style={styles.avatarImg}
                />
              </View>
              <Text style={styles.genderText}>Female</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={styles.nextButtonBottom} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── ÉCRAN 2: QUEST (Ajusté selon qst.jpg) ───
  if (step === 1) {
    const questions = [
      'Depleted: I need a "potion" (coffee) just to move.',
      "Low Battery: I'm dragging until midday.",
      "Steady: I have enough fuel for the basics.",
      "Overcharged: I'm ready to sprint into the day.",
    ];

    return (
      <ImageBackground
        source={require("../../assets/map_bg.png")}
        style={styles.mapContainer}
      >
        <View style={styles.overlayQuest}>
          {/* Titre descendu ici */}
          <Text style={styles.pixelTitleDark}>let us know you!</Text>

          <View style={styles.dialogWrapper}>
            <View style={styles.characterBlock}>
              <Image
                source={require("../../assets/trainer.png")}
                style={styles.trainerImg}
              />
              {/* Bulles de pensée repositionnées AU-DESSUS du perso */}
              <View style={styles.dotSmall} />
              <View style={styles.dotLarge} />
            </View>

            <View style={styles.speechBubble}>
              <Text style={styles.speechText}>
                "What is your current Power Level when you wake up?"
              </Text>
            </View>
          </View>

          <View style={styles.optionsList}>
            {questions.map((q) => (
              <TouchableOpacity
                key={q}
                style={[styles.optionBtn, goal === q && styles.optionBtnActive]}
                onPress={() => setGoal(q)}
              >
                <Text style={styles.optionBtnText}>{q}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.nextButtonQuest} onPress={handleNext}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.nextButtonText}>Next</Text>
            )}
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  // Structure
  whiteContainer: { flex: 1, backgroundColor: "#FFF", paddingHorizontal: 30 },
  mapContainer: { flex: 1 },
  content: { flex: 1, alignItems: "center", paddingTop: 80 },

  overlayQuest: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    paddingTop: 110, // Augmenté pour descendre le titre comme sur l'image
    paddingHorizontal: 20,
  },

  // Titres
  pixelTitle: {
    fontFamily: "Jersey20",
    fontSize: 34,
    textAlign: "center",
    color: "#000",
    marginBottom: 50,
  },
  pixelTitleDark: {
    fontFamily: "Jersey20",
    fontSize: 45,
    color: "#283618",
    marginBottom: 40, // Plus d'espace sous le titre
  },

  // Gender Styles
  genderContainer: { width: "100%", alignItems: "center", gap: 30 },
  genderItem: { alignItems: "center" },
  avatarCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1.5,
    borderColor: "#000",
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarSelected: {
    borderColor: "#283618",
    borderWidth: 4,
    backgroundColor: "#f0f1e8",
  },
  avatarImg: { width: "100%", height: "100%", resizeMode: "contain" },
  genderText: {
    fontFamily: "Jersey20",
    fontSize: 32,
    color: "#000",
    marginTop: 10,
  },

  // Dialogue & Trainer
  dialogWrapper: {
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
    marginBottom: 15,
  },
  characterBlock: {
    position: "relative",
    width: 75,
    height: 100,
    justifyContent: "flex-end",
  },
  trainerImg: { width: 65, height: 85, resizeMode: "contain" },

  // Bulles de pensée (Au-dessus du perso)
  dotSmall: {
    position: "absolute",
    top: 10,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#f2f3e8",
    borderWidth: 1,
    borderColor: "#dcdcdc",
  },
  dotLarge: {
    position: "absolute",
    top: -5,
    right: -10,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#f2f3e8",
    borderWidth: 1,
    borderColor: "#dcdcdc",
  },

  speechBubble: {
    backgroundColor: "#f2f3e8",
    borderRadius: 25,
    padding: 15,
    flex: 1,
    marginLeft: 20,
    marginTop: -10, // Remonte légèrement pour s'aligner avec les points
    borderWidth: 1,
    borderColor: "#dcdcdc",
  },
  speechText: {
    fontFamily: "Jersey20",
    fontSize: 18,
    textAlign: "center",
    color: "#000",
  },

  // Options (Grand Espacement)
  optionsList: { width: "100%", marginTop: 20, gap: 40 },
  optionBtn: {
    backgroundColor: "#fefae0",
    borderRadius: 35,
    paddingVertical: 18,
    paddingHorizontal: 15,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  optionBtnActive: { backgroundColor: "rgba(40, 54, 24, 0.4)" },
  optionBtnText: {
    fontFamily: "Jersey20",
    fontSize: 17,
    color: "#000",
    textAlign: "center",
  },

  // Boutons Next
  nextButtonBottom: {
    backgroundColor: "#283618",
    borderRadius: 40,
    width: "100%",
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  nextButtonQuest: {
    backgroundColor: "#222c14",
    borderRadius: 35,
    width: 170,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
  },
  nextButtonText: { color: "#FFF", fontFamily: "Jersey20", fontSize: 28 },
});
