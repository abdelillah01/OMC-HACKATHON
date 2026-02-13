import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { AVATAR_STAGES } from '../utils/constants';

export default function Avatar({ stage }) {
  const avatarData = AVATAR_STAGES[stage] || AVATAR_STAGES[1];

  return (
    <View style={styles.container}>
      <Image source={avatarData.image} style={styles.image} />
      <Text style={styles.name}>{avatarData.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#9b1c1c',
    marginBottom: 6,
  },
  name: {
    color: '#8c7a5e',
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Jersey20',
  },
});
