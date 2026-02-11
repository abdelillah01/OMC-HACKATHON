import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';

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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Edit Profile</Text>

        <Text style={styles.label}>Display Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor="#666"
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scroll: {
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
    marginBottom: 28,
  },
  label: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 14,
    color: '#eaeaea',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  readOnly: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#0f3460',
    opacity: 0.6,
  },
  readOnlyText: {
    color: '#aaa',
    fontSize: 16,
  },
  saveBtn: {
    backgroundColor: '#e94560',
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
  },
});
