import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import MainLayout from '../components/MainLayout';

export default function FriendsScreen({ navigation }) {
  const { user } = useAuth();
  const { profile } = useUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadUsers = async () => {
      try {
        const snap = await getDocs(collection(db, 'users'));
        const all = snap.docs
          .map((d) => ({ uid: d.id, ...d.data() }))
          .sort((a, b) => (b.xp || 0) - (a.xp || 0));
        if (mounted) setUsers(all);
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadUsers();
    return () => { mounted = false; };
  }, [user]);

  const myRank = users.findIndex((u) => u.uid === user?.uid) + 1;

  const renderUser = (item, index) => {
    const rank = index + 1;
    const isMe = item.uid === user?.uid;
    const xp = item.xp || 0;
    const level = item.level || 1;

    return (
      <View key={item.uid} style={[styles.card, isMe && styles.cardMe, rank <= 3 && styles.cardTop]}>
        <View style={[styles.rankBadge, rank === 1 && styles.rankGold, rank === 2 && styles.rankSilver, rank === 3 && styles.rankBronze]}>
          <Text style={[styles.rankText, rank <= 3 && styles.rankTextTop]}>
            {rank}
          </Text>
        </View>

        <View style={styles.avatarWrap}>
          <Image
            source={
              item.gender === 'female'
                ? require('../assets/avatars/female_avatar.png')
                : require('../assets/avatars/male_avatar.png')
            }
            style={styles.avatarImage}
          />
        </View>

        <View style={styles.info}>
          <Text style={[styles.name, isMe && styles.nameMe]}>
            {item.name || 'Adventurer'}{isMe ? ' (You)' : ''}
          </Text>
          <Text style={styles.levelText}>Level {level}</Text>
        </View>

        <View style={styles.xpWrap}>
          <Text style={styles.xpValue}>{xp}</Text>
          <Text style={styles.xpLabel}>XP</Text>
        </View>
      </View>
    );
  };

  return (
    <MainLayout
      navigation={navigation}
      title="Leaderboard"
      showEncouragement={false}
      showActionGrid={false}
    >
      {myRank > 0 && (
        <View style={styles.myRankBanner}>
          <Text style={styles.myRankText}>Your Rank: #{myRank} of {users.length}</Text>
        </View>
      )}

      {loading ? (
        <ActivityIndicator color="#9b1c1c" size="large" style={{ marginTop: 40 }} />
      ) : users.length === 0 ? (
        <Text style={styles.empty}>No users yet.</Text>
      ) : (
        users.map(renderUser)
      )}
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  myRankBanner: {
    backgroundColor: '#9b1c1c',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  myRankText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Jersey20',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8ec',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#8c9b6b',
  },
  cardMe: {
    borderColor: '#9b1c1c',
    backgroundColor: '#fff0d4',
  },
  cardTop: {
    borderWidth: 2,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#d4c9a8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  rankGold: {
    backgroundColor: '#f1c40f',
  },
  rankSilver: {
    backgroundColor: '#bdc3c7',
  },
  rankBronze: {
    backgroundColor: '#cd7f32',
  },
  rankText: {
    color: '#283618',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Jersey20',
  },
  rankTextTop: {
    color: '#fff',
  },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f2d6b3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  info: {
    flex: 1,
  },
  name: {
    color: '#283618',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Jersey20',
  },
  nameMe: {
    color: '#9b1c1c',
  },
  levelText: {
    color: '#8c7a5e',
    fontSize: 12,
    fontFamily: 'Jersey20',
  },
  xpWrap: {
    alignItems: 'center',
    marginLeft: 8,
  },
  xpValue: {
    color: '#9b1c1c',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Jersey20',
  },
  xpLabel: {
    color: '#8c7a5e',
    fontSize: 11,
    fontFamily: 'Jersey20',
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
