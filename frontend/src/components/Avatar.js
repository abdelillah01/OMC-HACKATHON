import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { AVATAR_STAGES } from '../utils/constants';

export default function Avatar({ stage }) {
  const avatarData = AVATAR_STAGES[stage] || AVATAR_STAGES[1];

  return (
    <View style={styles.container}>
      <Image source={avatarData.image} style={styles.image} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 12,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 40,
    marginTop: -30,
    marginBottom: -40,
  
  },
});
