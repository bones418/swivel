import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { COLORS } from '../constants/theme';

interface Props {
  onBack: () => void;
  onSuccess: () => void;
}

export function AuthScreen({ onBack, onSuccess }: Props) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function clearForm() {
    setError(null);
    setUsername('');
  }

  async function handleSubmit() {
    setError(null);

    if (mode === 'signup') {
      if (!email || !password || !username.trim()) {
        setError('Please fill in all fields.');
        return;
      }
      setLoading(true);
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username: username.trim() } },
      });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
    } else {
      if (!email || !password) {
        setError('Please enter your email and password.');
        return;
      }
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
    }
    setLoading(false);
    onSuccess();
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>SWIVEL</Text>

      <View style={styles.card}>
        <View style={styles.toggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'signin' && styles.toggleBtnActive]}
            onPress={() => { setMode('signin'); clearForm(); }}
          >
            <Text style={[styles.toggleText, mode === 'signin' && styles.toggleTextActive]}>
              Sign In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'signup' && styles.toggleBtnActive]}
            onPress={() => { setMode('signup'); clearForm(); }}
          >
            <Text style={[styles.toggleText, mode === 'signup' && styles.toggleTextActive]}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        {mode === 'signup' && (
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor={COLORS.titleText + '60'}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={COLORS.titleText + '60'}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={COLORS.titleText + '60'}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading
            ? <ActivityIndicator color={COLORS.titleText} />
            : <Text style={styles.submitBtnText}>{mode === 'signin' ? 'Sign In' : 'Create Account'}</Text>
          }
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backBtnText}>Continue as Guest</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    paddingHorizontal: 24,
  },
  title: {
    color: COLORS.titleText,
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: 12,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.cornerWood,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.woodBorder,
    padding: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  toggle: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.woodBorder,
    marginBottom: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: COLORS.woodBorder,
  },
  toggleText: {
    color: COLORS.titleText,
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.5,
  },
  toggleTextActive: {
    opacity: 1,
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.woodBorder,
    color: COLORS.titleText,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 13,
    textAlign: 'center',
  },
  successText: {
    color: '#69db7c',
    fontSize: 13,
    textAlign: 'center',
  },
  submitBtn: {
    backgroundColor: COLORS.cornerWood,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.woodBorder,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
  submitBtnText: {
    color: COLORS.titleText,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  backBtn: {
    padding: 12,
  },
  backBtnText: {
    color: COLORS.titleText,
    fontSize: 15,
    opacity: 0.55,
    fontWeight: '500',
  },
});
