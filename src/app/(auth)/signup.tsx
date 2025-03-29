import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { completeSignUp } from '../../api/users';

export default function SignUp() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [degree, setDegree] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    degree: ''
  });

  const validateField = (field: string) => {
    let error = '';

    switch (field) {
      case 'username':
        if (!username.trim()) error = 'Username is required';
        else if (username.trim().length < 3) error = 'Minimum 3 characters';
        break;
      case 'email':
        if (!email.trim()) error = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email)) error = 'Invalid email format';
        break;
      case 'password':
        if (!password) error = 'Password is required';
        else if (password.length < 6) error = 'Minimum 6 characters';
        break;
      case 'confirmPassword':
        if (confirmPassword !== password) error = 'Passwords do not match';
        break;
      case 'degree':
        if (!degree.trim()) error = 'Course is required';
        break;
    }

    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSignUp = async () => {
    validateField('username');
    validateField('email');
    validateField('password');
    validateField('confirmPassword');
    validateField('degree');

    const hasError = Object.values(errors).some(e => e !== '');
    if (hasError) return;

    try {
      const user = await completeSignUp(email, password, username, degree);
      console.log('User created:', user);
      router.replace('/(home)');
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message || 'Unknown error');
    }
  };

  const handleBack = () => {
    router.replace('../(auth)/signin');
  };

  const handleProfilePicUpload = () => {
    alert('Upload Profile Picture (functionality to be added)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={100}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.contentContainer}>
            <Text style={styles.title}>Create an Account</Text>

            {/** Username */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username :</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                onBlur={() => validateField('username')}
              />
              {errors.username ? <Text style={styles.error}>{errors.username}</Text> : null}
            </View>

            {/** Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email :</Text>
              <TextInput
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                onBlur={() => validateField('email')}
              />
              {errors.email ? <Text style={styles.error}>{errors.email}</Text> : null}
            </View>

            {/** Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password :</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                onBlur={() => validateField('password')}
              />
              {errors.password ? <Text style={styles.error}>{errors.password}</Text> : null}
            </View>

            {/** Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password :</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onBlur={() => validateField('confirmPassword')}
              />
              {errors.confirmPassword ? <Text style={styles.error}>{errors.confirmPassword}</Text> : null}
            </View>

            {/** Course */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Course :</Text>
              <TextInput
                style={styles.input}
                value={degree}
                onChangeText={(text) =>
                  setDegree(text.charAt(0).toUpperCase() + text.slice(1))
                }
                onBlur={() => validateField('degree')}
              />
              {errors.degree ? <Text style={styles.error}>{errors.degree}</Text> : null}
            </View>

            {/** Profile Picture Upload */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Upload Profile Picture :</Text>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={handleProfilePicUpload}
              >
                <Text style={styles.uploadButtonText}>Choose File</Text>
              </TouchableOpacity>
            </View>

            {/** Sign Up */}
            <TouchableOpacity style={styles.signupButton} onPress={handleSignUp}>
              <Text style={styles.signupButtonText}>Sign Up</Text>
            </TouchableOpacity>

            {/** Login Redirect */}
            <View style={styles.loginContainer}>
              <Text style={styles.haveAccountText}>Already have an Account? </Text>
              <TouchableOpacity onPress={handleBack}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  keyboardView: { flex: 1 },
  scrollContainer: { paddingBottom: 40 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  contentContainer: { flex: 1, paddingHorizontal: 30 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    alignSelf: 'center',
    letterSpacing: 1.4,
  },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, marginBottom: 10, letterSpacing: 1.0 },
  input: {
    backgroundColor: '#CDECFF',
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 14,
    color: '#000',
    letterSpacing: 1.0,
  },
  error: {
    color: 'red',
    marginTop: 5,
    fontSize: 13,
    letterSpacing: 0.5,
  },
  uploadButton: {
    backgroundColor: '#D9EFFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  uploadButtonText: {
    color: '#075DB6',
    fontSize: 14,
    fontWeight: '500',
  },
  signupButton: {
    backgroundColor: '#075DB6',
    width: 160,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 40,
    alignSelf: 'center',
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1.0,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  haveAccountText: {
    fontSize: 14,
    color: '#555',
    letterSpacing: 1.0,
  },
  loginLink: {
    fontSize: 14,
    color: '#075DB6',
    fontWeight: 'bold',
    letterSpacing: 1.0,
  },
});
