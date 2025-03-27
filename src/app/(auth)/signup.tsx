import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SignUp() {
  const router = useRouter();

  const handleSignUp = () => {
    //To home page
    router.replace('/(home)');
  };

  const handleLogin = () => {
    //To sign in page
    router.push('../(auth)/signin');
  };

  const handleBack = () => {
    //Back to previous page(sign in page)
    router.push('../(auth)/signin');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Create an Account</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username :</Text>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email :</Text>
            <TextInput
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password :</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password :</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
            />
          </View>
          
          <TouchableOpacity style={styles.signupButton} onPress={handleSignUp}>
            <Text style={styles.signupButtonText}>Sign Up</Text>
          </TouchableOpacity>
          
          <View style={styles.loginContainer}>
            <Text style={styles.haveAccountText}>Already have an Account? </Text>
            <TouchableOpacity onPress={handleLogin}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 50,
    alignSelf: 'center',
    letterSpacing: 1.4,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 20,
    letterSpacing: 1.0,
  },
  label: {
    fontSize: 14,
    marginBottom: 10,
    letterSpacing: 1.0,
  },
  input: {
    backgroundColor: '#CDECFF',
    width: '100%',
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 14,
    color: '#777777',
    letterSpacing: 1.0,
  },
  signupButton: {
    backgroundColor: '#075DB6',
    width: 160,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 80,
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