import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/MainLayout';

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

  const renderUser = (item) => {
    const xp = item.xp || 0;
    const level = item.level || 1;
    const xpForNextLevel = level * 100;
    const progressPercent = Math.min((xp / xpForNextLevel) * 100, 100);

    return (
      <View key={item.uid} style={styles.friendCard}>
        <View style={styles.pixelAvatar}>
          <Image
            source={
              item.gender === 'female'
                ? require('../assets/avatars/female_avatar.png')
                : require('../assets/avatars/male_avatar.png')
            }
            style={styles.avatarImage}
          />
        </View>
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{item.name || 'Adventurer'}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>
        <Text style={styles.rose}></Text>
      </View>
    );
  };

  return (
    <MainLayout
      navigation={navigation}
      title="Friends"
      showEncouragement={false}
      showActionGrid={false}
    >
      <Text style={styles.subtitle}>{users.length} adventurers on the quest</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search by name..."
        placeholderTextColor="#b5a98a"
        value={search}
        onChangeText={setSearch}
      />

      {loading ? (
        <ActivityIndicator color="#9b1c1c" size="large" style={{ marginTop: 40 }} />
      ) : filtered.length === 0 ? (
        <Text style={styles.empty}>
          {search.trim() ? 'No friends match that name.' : 'No other users yet.'}
        </Text>
      ) : (
        filtered.map(renderUser)
      )}
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 13,
    color: '#8c7a5e',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Jersey20',
  },
  searchInput: {
    backgroundColor: '#fff8ec',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#283618',
    fontSize: 15,
    borderWidth: 2,
    borderColor: '#8c9b6b',
    marginBottom: 16,
    fontFamily: 'Jersey20',
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8ec',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#8c9b6b',
  },
  pixelAvatar: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#f2d6b3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    color: '#283618',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    fontFamily: 'Jersey20',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f1c0c0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#9b1c1c',
    borderRadius: 3,
  },
  rose: {
    fontSize: 20,
    marginLeft: 10,
  },
  empty: {
    color: '#8c7a5e',
    textAlign: 'center',
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 40,
    fontFamily: 'Jersey20',
  },
});
