import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { LogIn } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { COLORS } from '@/constants/Colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login, loading } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setError(null);
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (err) {
      setError((err as Error).message || 'Failed to log in');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' }}
            style={styles.logoBackground}
          />
          <View style={styles.overlay} />
          <Text style={styles.title}>CampusConnect</Text>
          <Text style={styles.subtitle}>Your University Companion</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Login</Text>
          
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your university email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <Text style={styles.passwordNote}>Password must be at least 6 characters</Text>
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <LogIn size={20} color="white" />
                <Text style={styles.loginButtonText}>Login</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={styles.registerLink}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  logoContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  logoBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: 'white',
  },
  formContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 24,
  },
  formTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: COLORS.primary,
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: COLORS.error + '20',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    color: COLORS.error,
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: 8,
    color: COLORS.darkGrey,
  },
  input: {
    fontFamily: 'Inter-Regular',
    backgroundColor: COLORS.lightGrey,
    height: 50,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  passwordNote: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.textMedium,
    marginTop: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontFamily: 'Inter-Medium',
    color: COLORS.secondary,
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  loginButtonText: {
    fontFamily: 'Inter-Bold',
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    fontFamily: 'Inter-Regular',
    color: COLORS.darkGrey,
    fontSize: 14,
  },
  registerLink: {
    fontFamily: 'Inter-Bold',
    color: COLORS.primary,
    fontSize: 14,
  },
});