import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import MainLayout from '../components/MainLayout';

export default function EditProfileScreen({ navigation }) {
  const { user } = useAuth();
  const { profile } = useUser();
  const [name, setName] = useState(profile?.name || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), { name: trimmed });
      Alert.alert('Saved!', 'Your profile has been updated.');
      navigation.goBack();
    } catch (err) {
      console.error('Edit profile error:', err);
      Alert.alert('Oops', 'Could not save changes. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <MainLayout
        navigation={navigation}
        title="Edit Profile"
        showEncouragement={false}
        showActionGrid={false}
      >
        <View style={styles.avatarSection}>
          <Image
            source={
              profile?.gender === 'female'
                ? require('../assets/avatars/female_avatar.png')
                : require('../assets/avatars/male_avatar.png')
            }
            style={styles.avatarImage}
          />
        </View>

        <Text style={styles.label}>Display Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor="#b5a98a"
          maxLength={30}
        />

        <Text style={styles.label}>Email</Text>
        <View style={styles.readOnly}>
          <Text style={styles.readOnlyText}>{profile?.email || user?.email}</Text>
        </View>

        <Text style={styles.label}>Level</Text>
        <View style={styles.readOnly}>
          <Text style={styles.readOnlyText}>Level {profile?.level || 1}</Text>
        </View>

        <Text style={styles.label}>Total XP</Text>
        <View style={styles.readOnly}>
          <Text style={styles.readOnlyText}>{profile?.xp || 0} XP</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.saveBtn, (!name.trim() || saving) && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={!name.trim() || saving}
        >
          <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
        </TouchableOpacity>
      </MainLayout>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  avatarSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    resizeMode: 'cover',
  },
  label: {
    color: '#8c7a5e',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 16,
    fontFamily: 'Jersey20',
  },
  input: {
    backgroundColor: '#fff8ec',
    borderRadius: 12,
    padding: 14,
    color: '#283618',
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: '#8c9b6b',
    fontFamily: 'Jersey20',
  },
  readOnly: {
    backgroundColor: '#fff8ec',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#8c9b6b',
    opacity: 0.6,
  },
  readOnlyText: {
    color: '#8c7a5e',
    fontSize: 16,
    fontFamily: 'Jersey20',
  },
  saveBtn: {
    backgroundColor: '#9b1c1c',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 32,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'Jersey20',
  },
});
