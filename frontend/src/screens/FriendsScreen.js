import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { AVATAR_STAGES } from '../utils/constants';
import { getAvatarStage } from '../utils/helpers';

export default function FriendsScreen({ navigation }) {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadUsers = async () => {
      try {
        const snap = await getDocs(collection(db, 'users'));
        const all = snap.docs
          .map((d) => ({ uid: d.id, ...d.data() }))
          .filter((u) => u.uid !== user?.uid)
          .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        if (mounted) setUsers(all);
      } catch (err) {
        console.error('Failed to load friends:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadUsers();
    return () => { mounted = false; };
  }, [user]);

  const filtered = search.trim()
    ? users.filter((u) =>
        (u.name || '').toLowerCase().includes(search.trim().toLowerCase())
      )
    : users;

  const renderUser = ({ item }) => {
    const stage = getAvatarStage(item.level || 1);
    const stageName = AVATAR_STAGES[stage]?.name || 'Villager';

    return (
      <View style={styles.card}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarEmoji}>
            {stage === 4 ? '🛡️' : stage === 3 ? '⚔️' : stage === 2 ? '🎒' : '🧑'}
          </Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name || 'Adventurer'}</Text>
          <Text style={styles.meta}>
            Level {item.level || 1} · {stageName}
          </Text>
        </View>
        <View style={styles.xpBadge}>
          <Text style={styles.xpText}>{item.xp || 0}</Text>
          <Text style={styles.xpLabel}>XP</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Friends</Text>
      <Text style={styles.subtitle}>{users.length} adventurers on the quest</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search by name..."
        placeholderTextColor="#666"
        value={search}
        onChangeText={setSearch}
      />

      {loading ? (
        <ActivityIndicator color="#e94560" size="large" style={{ marginTop: 40 }} />
      ) : filtered.length === 0 ? (
        <Text style={styles.empty}>
          {search.trim() ? 'No friends match that name.' : 'No other users yet.'}
        </Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.uid}
          renderItem={renderUser}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
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
    marginBottom: 20,
  },
  backText: {
    color: '#e94560',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#eaeaea',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#eaeaea',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#0f3460',
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0f3460',
    marginRight: 14,
  },
  avatarEmoji: {
    fontSize: 22,
  },
  info: {
    flex: 1,
  },
  name: {
    color: '#eaeaea',
    fontSize: 16,
    fontWeight: '600',
  },
  meta: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  xpBadge: {
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e94560',
  },
  xpText: {
    color: '#e94560',
    fontSize: 15,
    fontWeight: '700',
  },
  xpLabel: {
    color: '#e94560',
    fontSize: 10,
    fontWeight: '500',
  },
  empty: {
    color: '#666',
    textAlign: 'center',
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 40,
  },
});
