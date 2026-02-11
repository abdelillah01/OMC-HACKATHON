import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function FriendsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.icon}>👥</Text>
      <Text style={styles.title}>See Your Friends</Text>
      <Text style={styles.subtitle}>
        This feature is coming soon! You'll be able to add friends, compare progress, and cheer each other on.
      </Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Coming Soon</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 24,
    paddingTop: 56,
  },
  backBtn: {
    marginBottom: 40,
  },
  backText: {
    color: '#e94560',
    fontSize: 16,
    fontWeight: '600',
  },
  icon: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#eaeaea',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
    marginHorizontal: 20,
    marginBottom: 30,
  },
  badge: {
    alignSelf: 'center',
    backgroundColor: '#16213e',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#e94560',
  },
  badgeText: {
    color: '#e94560',
    fontSize: 14,
    fontWeight: '600',
  },
});
