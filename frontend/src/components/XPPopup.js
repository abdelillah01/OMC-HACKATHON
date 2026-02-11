import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

export default function XPPopup({ amount }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in, float up, fade out
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -30,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1000),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -60,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.Text
      style={[
        styles.popup,
        { opacity, transform: [{ translateY }] },
      ]}
    >
      +{amount} XP
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  popup: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f39c12',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
});
