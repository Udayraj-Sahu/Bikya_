import { StyleSheet, View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { login } from '@/redux/slices/authSlice';
import Colors from '@/constants/Colors';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { Mail, Lock, ArrowLeft } from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(state => state.auth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleLogin = async () => {
    // Basic validation
    if (!email || !password) {
      setValidationError('Please fill in all fields');
      return;
    }
    
    if (!email.includes('@')) {
      setValidationError('Please enter a valid email');
      return;
    }
    
    setValidationError(null);
    
    // Demo credentials for different roles
    let credentials = { email, password };
    
    // For demo purposes, you can uncomment these lines to easily test different roles
    // For User role
    // credentials = { email: 'user@example.com', password: 'password' };
    
    // For Admin role
    // credentials = { email: 'admin@example.com', password: 'password' };
    
    // For Owner role
    // credentials = { email: 'owner@example.com', password: 'password' };
    
    try {
      const resultAction = await dispatch(login(credentials));
      if (login.fulfilled.match(resultAction)) {
        const { user } = resultAction.payload;
        if (user.role === 'user') {
          router.replace('/(app)/(user)');
        } else if (user.role === 'admin') {
          router.replace('/(app)/(admin)');
        } else if (user.role === 'owner') {
          router.replace('/(app)/(owner)');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Login to your account</Text>
        </View>
        
        <View style={styles.formContainer}>
          {(validationError || error) && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{validationError || error}</Text>
            </View>
          )}
          
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            leftIcon={<Mail size={20} color={Colors.light.grey4} />}
          />
          
          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            leftIcon={<Lock size={20} color={Colors.light.grey4} />}
          />
          
          <TouchableOpacity style={styles.forgotPasswordContainer}>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>
          
          <Button
            title="Login"
            onPress={handleLogin}
            loading={isLoading}
            fullWidth
          />
          
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.demoCredentials}>
          <Text style={styles.demoTitle}>Demo Credentials</Text>
          <View style={styles.credentialItem}>
            <Text style={styles.credentialRole}>User:</Text>
            <Text style={styles.credentialText}>user@example.com / password</Text>
          </View>
          <View style={styles.credentialItem}>
            <Text style={styles.credentialRole}>Admin:</Text>
            <Text style={styles.credentialText}>admin@example.com / password</Text>
          </View>
          <View style={styles.credentialItem}>
            <Text style={styles.credentialRole}>Owner:</Text>
            <Text style={styles.credentialText}>owner@example.com / password</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.grey3,
  },
  formContainer: {
    marginBottom: 32,
  },
  errorContainer: {
    backgroundColor: `${Colors.light.danger}15`,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.danger,
  },
  errorText: {
    color: Colors.light.danger,
    fontSize: 14,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPassword: {
    color: Colors.light.primary,
    fontSize: 14,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  signupText: {
    color: Colors.light.grey3,
    fontSize: 14,
  },
  signupLink: {
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  demoCredentials: {
    padding: 16,
    backgroundColor: Colors.light.divider,
    borderRadius: 8,
    marginTop: 'auto',
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  credentialItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  credentialRole: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.grey2,
    width: 50,
  },
  credentialText: {
    fontSize: 12,
    color: Colors.light.grey2,
  },
});