import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';

export default function ResetFailScreen() {
  const router = useRouter();

  const handleBack = () => {
    router.replace('../(auth)/forgot-password');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoGraphic}>
            <View style={styles.dot1} />
            <View style={styles.dot2} />
            <View style={styles.dot3} />
            <View style={styles.dot4} />
            <View style={styles.dot5} />
          </View>
          <Text style={styles.logoText}>Huddled</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Link Expired</Text>
          <Text style={styles.expiredIcon}>✗</Text>
          <Text style={styles.description}>
            Sorry, your reset password link is no longer valid. To reset your password, return to 'forget password' page and request again.
          </Text>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBack}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>Back</Text>
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
  logoGraphic: {
    position: 'relative',
    width: 70,
    height: 70,
    marginBottom: 10,
  },
  dot1: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#80C1E0',
    left: 10,
    top: 25,
  },
  dot2: {
    position: 'absolute',
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#80C1E0',
    left: 35,
    top: 15,
  },
  dot3: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#80C1E0',
    right: 12,
    top: 10,
  },
  dot4: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#80C1E0',
    right: 5,
    top: 25,
  },
  dot5: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#80C1E0',
    right: 18,
    top: 40,
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
  expiredIcon: {
    fontSize: 48,
    color: 'red',
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
  backButton: {
    backgroundColor: '#3268c7',
    borderRadius: 8,
    padding: 15,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 