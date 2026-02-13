import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function StreakBadge({ streak }) {
  return (
    <View style={styles.container}>
      <Image source={require('../assets/fire.png')} style={styles.flame} />
      <Text style={styles.count}>{streak}</Text>
      <Text style={styles.label}>day streak</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8ec',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: '#8c9b6b',
  },
  flame: {
    width: 20,
    height: 20,
    marginRight: 4,
    resizeMode: 'contain',
  },
  count: {
    color: '#f39c12',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 4,
    fontFamily: 'Jersey20',
  },
  label: {
    color: '#8c7a5e',
    fontSize: 13,
    fontFamily: 'Jersey20',
  },
});
