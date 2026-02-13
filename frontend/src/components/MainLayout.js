import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export default function MainLayout({
  navigation,
  children,
  title = 'welcome back!',
  noScroll = false,
  refreshControl,
  showEncouragement = true,
  showActionGrid = true,
  overlays,
}) {
  const openDrawer = () => {
    let nav = navigation;
    while (nav) {
      if (nav.openDrawer) {
        nav.openDrawer();
        return;
      }
      nav = nav.getParent?.();
    }
  };

  const hamburger = (
    <TouchableOpacity
      activeOpacity={0.6}
      style={noScroll ? styles.hamburgerAbsolute : styles.hamburger}
      onPress={openDrawer}
    >
      <View style={styles.hamburgerLine} />
      <View style={styles.hamburgerLine} />
      <View style={styles.hamburgerLine} />
    </TouchableOpacity>
  );

  if (noScroll) {
    return (
      <View style={styles.container}>
        {hamburger}
        {children}
        {overlays}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      >
        {hamburger}

        <Text style={styles.title}>{title}</Text>

        <View style={styles.characterStrip}>
          <Text style={styles.characterEmoji}>🧙</Text>
          <Text style={styles.characterEmoji}>🧝</Text>
          <Text style={styles.characterEmoji}>🧑‍🌾</Text>
          <Text style={styles.characterEmoji}>🏰</Text>
          <Text style={styles.characterEmoji}>⚔️</Text>
        </View>

        {children}

        {showEncouragement && (
          <View style={styles.encouragement}>
            <Text style={styles.encourageEmoji}>🧝‍♀️</Text>
            <Text style={styles.encourageText}>
              You're here! that's already something
            </Text>
          </View>
        )}

        {showActionGrid && (
          <View style={styles.actionGrid}>
            <View style={styles.actionCard}>
              <Text style={styles.actionEmoji}>🌿</Text>
              <Text style={styles.actionLabel}>breathe</Text>
            </View>
            <View style={styles.actionCard}>
              <Text style={styles.actionEmoji}>💧</Text>
              <Text style={styles.actionLabel}>hydrate</Text>
            </View>
            <View style={styles.actionCard}>
              <Text style={styles.actionEmoji}>🚶</Text>
              <Text style={styles.actionLabel}>move</Text>
            </View>
            <View style={styles.actionCard}>
              <Text style={styles.actionEmoji}>➕</Text>
              <Text style={styles.actionLabel}>add</Text>
            </View>
          </View>
        )}
      </ScrollView>
      {overlays}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8dc',
  },
  scroll: {
    padding: 24,
    paddingTop: 56,
    paddingBottom: 30,
  },
  hamburger: {
    width: 32,
    height: 24,
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  hamburgerAbsolute: {
    position: 'absolute',
    top: 56,
    left: 20,
    zIndex: 10,
    width: 32,
    height: 24,
    justifyContent: 'space-between',
  },
  hamburgerLine: {
    width: 28,
    height: 3,
    backgroundColor: '#8c7a5e',
    borderRadius: 2,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#283618',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Jersey20',
  },
  characterStrip: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 12,
  },
  characterEmoji: {
    fontSize: 28,
  },
  encouragement: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  encourageEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  encourageText: {
    fontSize: 15,
    color: '#8c7a5e',
    textAlign: 'center',
    fontFamily: 'Jersey20',
    fontStyle: 'italic',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionCard: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#fff8ec',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#8c9b6b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 14,
    color: '#283618',
    fontWeight: '600',
    fontFamily: 'Jersey20',
  },
});
