import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { AVATAR_STAGES, AVATAR_STAGES_FEMALE } from '../utils/constants';

export default function Avatar({ stage, gender }) {
  const stages = gender === 'female' ? AVATAR_STAGES_FEMALE : AVATAR_STAGES;
  const avatarData = stages[stage] || stages[1];

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
