import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { getHabitCompletions } from '../services/habitService';
import { HABIT_TEMPLATES } from '../utils/constants';

// Build a quick lookup: habitId → title
const habitTitleMap = {};
HABIT_TEMPLATES.forEach((h) => {
  habitTitleMap[h.id] = h.title;
});

function formatDate(timestamp) {
  if (!timestamp) return '';
  // Firestore Timestamp → JS Date
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

export default function ProgressScreen() {
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
        <ActivityIndicator size="large" color="#e94560" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#e94560"
          />
        }
      >
        <Text style={styles.title}>Your Progress</Text>

        {/* Stats cards */}
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

        {/* History */}
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  centered: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#eaeaea',
    marginBottom: 20,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#16213e',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e94560',
  },
  statLabel: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },

  // History section
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#eaeaea',
    marginTop: 20,
    marginBottom: 14,
  },
  empty: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
  historyItem: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  historyLeft: {
    flex: 1,
    marginRight: 12,
  },
  historyTitle: {
    color: '#eaeaea',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  historyTime: {
    color: '#666',
    fontSize: 12,
  },
  historyXP: {
    color: '#e94560',
    fontSize: 15,
    fontWeight: '700',
  },
});
