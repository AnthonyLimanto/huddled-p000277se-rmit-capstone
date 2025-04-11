import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';

export default function ResetDoneScreen() {
  const router = useRouter();

  const handleLogin = () => {
    // TODO: Replace with actual login screen   
    router.replace('../(auth)/reset-fail');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.logoContainer}>
          <Image source={require('../../../assets/images/icon-only.png')} style={styles.logoImage} />
          <Text style={styles.logoText}>Huddled</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Successful Reset</Text>
          <Text style={styles.description}>
            You can now use your new password to log in into your account.
          </Text>
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
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
    position: 'relative',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 30,
  },
  logoImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#80C1E0',
  },
  card: {
    flex: 1,
    backgroundColor: '#E5F3FD',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    color: '#555',
    lineHeight: 22,
    paddingHorizontal: 15,
  },
  loginButton: {
    backgroundColor: '#3268c7',
    borderRadius: 8,
    padding: 15,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 