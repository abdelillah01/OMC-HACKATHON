import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { getHabitCompletions } from '../services/habitService';
import { HABIT_TEMPLATES } from '../utils/constants';
import MainLayout from '../components/MainLayout';

const habitTitleMap = {};
HABIT_TEMPLATES.forEach((h) => {
  habitTitleMap[h.id] = h.title;
});

function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export default function ProgressScreen({ navigation }) {
  const { user } = useAuth();
  const { profile } = useUser();
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getHabitCompletions(user.uid);
      setCompletions(data);
    } catch (err) {
      console.error('Failed to load completions:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#9b1c1c" />
      </View>
    );
  }

  return (
    <MainLayout
      navigation={navigation}
      title="Your Progress"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9b1c1c" />
      }
      showActionGrid={false}
      showEncouragement={false}
    >
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{profile?.level || 1}</Text>
          <Text style={styles.statLabel}>Level</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{profile?.xp || 0}</Text>
          <Text style={styles.statLabel}>Total XP</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{profile?.streak || 0}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{completions.length}</Text>
          <Text style={styles.statLabel}>Completions</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Activity History</Text>

      {completions.length === 0 ? (
        <Text style={styles.empty}>
          No completions yet — start your first habit!
        </Text>
      ) : (
        completions.map((item) => (
          <View key={item.id} style={styles.historyItem}>
            <View style={styles.historyLeft}>
              <Text style={styles.historyTitle}>
                {habitTitleMap[item.habitId] || 'Habit'}
              </Text>
              <Text style={styles.historyTime}>
                {formatDate(item.completedAt)}
              </Text>
            </View>
            <Text style={styles.historyXP}>+{item.xpAwarded} XP</Text>
          </View>
        ))
      )}
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: '#fff8dc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff8ec',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#8c9b6b',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#9b1c1c',
    fontFamily: 'Jersey20',
  },
  statLabel: {
    fontSize: 13,
    color: '#8c7a5e',
    marginTop: 4,
    fontFamily: 'Jersey20',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#283618',
    marginTop: 20,
    marginBottom: 14,
    fontFamily: 'Jersey20',
  },
  empty: {
    color: '#8c7a5e',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'Jersey20',
  },
  historyItem: {
    backgroundColor: '#fff8ec',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#8c9b6b',
  },
  historyLeft: {
    flex: 1,
    marginRight: 12,
  },
  historyTitle: {
    color: '#283618',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
    fontFamily: 'Jersey20',
  },
  historyTime: {
    color: '#8c7a5e',
    fontSize: 12,
    fontFamily: 'Jersey20',
  },
  historyXP: {
    color: '#9b1c1c',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Jersey20',
  },
});
